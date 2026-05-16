-- AvalAyllu: Schema de Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== TABLAS =====================

-- Usuarios (sincroniza con Supabase Auth + wallet)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  ayni_score INTEGER DEFAULT 500,
  ayllus_completed INTEGER DEFAULT 0,
  total_contributed BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para busqueda por wallet
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Ayllus (cache off-chain de datos on-chain)
CREATE TABLE ayllus (
  id SERIAL PRIMARY KEY,
  onchain_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  creator_wallet TEXT NOT NULL REFERENCES users(wallet_address),
  contribution_amount BIGINT NOT NULL,
  round_duration INTEGER NOT NULL,
  max_members SMALLINT NOT NULL,
  current_member_count SMALLINT DEFAULT 1,
  current_round SMALLINT DEFAULT 0,
  status TEXT DEFAULT 'FORMING' CHECK (status IN ('FORMING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ayllus_status ON ayllus(status);
CREATE INDEX idx_ayllus_creator ON ayllus(creator_wallet);

-- Miembros de Ayllu
CREATE TABLE ayllu_members (
  id SERIAL PRIMARY KEY,
  ayllu_id INTEGER NOT NULL REFERENCES ayllus(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  position SMALLINT NOT NULL,
  has_received_pot BOOLEAN DEFAULT FALSE,
  total_contributed BIGINT DEFAULT 0,
  late_payments INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ayllu_id, wallet_address)
);

CREATE INDEX idx_members_ayllu ON ayllu_members(ayllu_id);
CREATE INDEX idx_members_wallet ON ayllu_members(wallet_address);

-- Contribuciones (historial)
CREATE TABLE contributions (
  id SERIAL PRIMARY KEY,
  ayllu_id INTEGER NOT NULL REFERENCES ayllus(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  amount BIGINT NOT NULL,
  round SMALLINT NOT NULL,
  is_late BOOLEAN DEFAULT FALSE,
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_ayllu ON contributions(ayllu_id);
CREATE INDEX idx_contributions_wallet ON contributions(wallet_address);
CREATE INDEX idx_contributions_tx ON contributions(tx_hash);

-- Historial de score
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT DEFAULT 'contract' CHECK (source IN ('contract', 'claude_ai', 'wavy_node', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_score_history_wallet ON score_history(wallet_address);

-- Distribuciones de pot
CREATE TABLE pot_distributions (
  id SERIAL PRIMARY KEY,
  ayllu_id INTEGER NOT NULL REFERENCES ayllus(id) ON DELETE CASCADE,
  recipient_wallet TEXT NOT NULL REFERENCES users(wallet_address),
  amount BIGINT NOT NULL,
  round SMALLINT NOT NULL,
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== ROW LEVEL SECURITY =====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayllus ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayllu_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pot_distributions ENABLE ROW LEVEL SECURITY;

-- Politicas: lectura publica, escritura solo para el owner
CREATE POLICY "Usuarios visibles para todos" ON users FOR SELECT USING (true);
CREATE POLICY "Usuario actualiza su propio perfil" ON users FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address');

CREATE POLICY "Ayllus visibles para todos" ON ayllus FOR SELECT USING (true);
CREATE POLICY "Solo servicio crea ayllus" ON ayllus FOR INSERT WITH CHECK (true);
CREATE POLICY "Solo servicio actualiza ayllus" ON ayllus FOR UPDATE USING (true);

CREATE POLICY "Miembros visibles para todos" ON ayllu_members FOR SELECT USING (true);
CREATE POLICY "Solo servicio gestiona miembros" ON ayllu_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Contribuciones visibles para todos" ON contributions FOR SELECT USING (true);
CREATE POLICY "Solo servicio registra contribuciones" ON contributions FOR INSERT WITH CHECK (true);

CREATE POLICY "Score history visible para el usuario" ON score_history FOR SELECT USING (true);
CREATE POLICY "Solo servicio registra score" ON score_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Distribuciones visibles para todos" ON pot_distributions FOR SELECT USING (true);
CREATE POLICY "Solo servicio registra distribuciones" ON pot_distributions FOR INSERT WITH CHECK (true);

-- ===================== FUNCIONES =====================

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_ayllus_updated_at
  BEFORE UPDATE ON ayllus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Funcion RPC: obtener estadisticas de la plataforma
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_ayllus', (SELECT COUNT(*) FROM ayllus),
    'active_ayllus', (SELECT COUNT(*) FROM ayllus WHERE status = 'ACTIVE'),
    'completed_ayllus', (SELECT COUNT(*) FROM ayllus WHERE status = 'COMPLETED'),
    'total_contributed', (SELECT COALESCE(SUM(amount), 0) FROM contributions),
    'total_distributions', (SELECT COALESCE(SUM(amount), 0) FROM pot_distributions)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcion RPC: leaderboard por score
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(wallet_address TEXT, display_name TEXT, ayni_score INTEGER, ayllus_completed INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT u.wallet_address, u.display_name, u.ayni_score, u.ayllus_completed
  FROM users u
  ORDER BY u.ayni_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
