"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Mountain, Users, Coins, Shield, ArrowRight, Zap, Globe, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const steps = [
  {
    icon: Users,
    title: "Forma tu Ayllu",
    description: "Reune a tu grupo de confianza. De 2 a 20 personas acuerdan un monto y frecuencia de ahorro.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Coins,
    title: "Aporta cada ronda",
    description: "Todos contribuyen USDC al contrato inteligente. Sin intermediarios, sin comisiones ocultas.",
    color: "text-ayllu-sun",
    bg: "bg-ayllu-sun/10",
  },
  {
    icon: Shield,
    title: "Construye tu score",
    description: "Tu historial de pagos genera un Ayni Score con IA, que te da acceso a credito institucional.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
];

const features = [
  {
    icon: Zap,
    title: "Transacciones en segundos",
    description: "Avalanche C-Chain confirma transacciones en menos de 2 segundos.",
  },
  {
    icon: Shield,
    title: "Fondos protegidos",
    description: "Smart contracts auditados con ReentrancyGuard y SafeERC20.",
  },
  {
    icon: Globe,
    title: "Para toda LatAm",
    description: "Desde Bolivia hasta Mexico, el Pasanaku digital sin fronteras.",
  },
  {
    icon: TrendingUp,
    title: "Credito real",
    description: "Tu Ayni Score te conecta con Arkangeles y Bankaool para financiamiento.",
  },
];

const partners = [
  { name: "Avalanche", role: "Blockchain" },
  { name: "Arkangeles", role: "Financiamiento colectivo" },
  { name: "Bankaool", role: "Banca digital" },
  { name: "Wavy Node", role: "Risk scoring" },
  { name: "Oracle", role: "Infraestructura" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Mountain className="h-7 w-7 text-ayllu-sun" />
            <span className="font-display font-bold text-xl text-white">
              Aval<span className="text-ayllu-sun">Ayllu</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-andean opacity-60" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-ayllu-sun/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-avax-red/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Hackathon LatAm Institucional Avalanche 2026
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-display font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            El Pasanaku
            <br />
            <span className="text-gradient-sun">en Blockchain</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ahorro rotativo descentralizado en Avalanche. Inspirado en el Ayni
            andino — donde la reciprocidad construye comunidad y credito.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/dashboard" className="btn-primary text-lg flex items-center gap-2">
              Empezar ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#como-funciona" className="btn-secondary text-lg">
              Como funciona
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { value: "< 2s", label: "Finalidad" },
              { value: "$0.01", label: "Por tx" },
              { value: "100%", label: "On-chain" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-ayllu-sun">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Como funciona
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              El mismo Pasanaku de confianza, ahora con la seguridad de contratos inteligentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="glass-card relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-ayllu-sun flex items-center justify-center text-ayllu-night font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className={`w-14 h-14 rounded-xl ${step.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Por que <span className="text-gradient-sun">AvalAyllu</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  className="glass-card text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Icon className="h-8 w-8 text-ayllu-sun mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">{feat.title}</h4>
                  <p className="text-sm text-white/50">{feat.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Que es el Ayni */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-card border-ayllu-sun/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-sun flex items-center justify-center">
                  <Mountain className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold mb-3">
                  Que es el <span className="text-ayllu-sun">Ayni</span>?
                </h3>
                <p className="text-white/60 leading-relaxed">
                  El Ayni es el principio andino de reciprocidad: &quot;hoy por ti, manana por mi&quot;.
                  En las comunidades quechua y aymara, el Ayllu es la unidad de cooperacion social.
                  El Pasanaku boliviano lleva siglos funcionando asi — un grupo ahorra junto,
                  y cada miembro recibe el pozo completo cuando le toca. AvalAyllu lleva
                  esta tradicion milenaria al blockchain, creando un historial crediticio
                  verificable para los 400+ millones de latinoamericanos sin acceso bancario.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Ecosistema</h2>
            <p className="text-white/50">Construido con la confianza de instituciones reales.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="glass-card text-center px-8 py-6 min-w-[160px]"
              >
                <div className="text-lg font-semibold text-white">{partner.name}</div>
                <div className="text-xs text-white/40 mt-1">{partner.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-display font-bold mb-4">
              Empieza a construir tu <span className="text-gradient-sun">historial crediticio</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Conecta tu wallet, forma tu Ayllu, y demuestra tu compromiso financiero on-chain.
            </p>
            <Link href="/dashboard" className="btn-primary text-lg inline-flex items-center gap-2">
              Ir al Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
