# Script de Demo — AvalAyllu (3-5 minutos)

## Antes de presentar
- Tener MetaMask conectado a Fuji con AVAX y USDC
- Tener avalayllu.vercel.app abierto en una tab
- Tener el deck.html abierto en otra tab (o PDF)

---

## MINUTO 0-1: Problema + Solucion (Slides 1-3)

**Decir:**
> "En Latinoamerica, 200 millones de personas ahorran en grupos rotativos
> informales — pasanaku en Bolivia, tanda en Mexico, vaca en Colombia.
> Funcionan, pero tienen un problema fundamental: dependen 100% de la confianza.
> Si alguien no paga, o el organizador desaparece, se pierde todo.
>
> AvalAyllu resuelve esto con smart contracts en Avalanche.
> El contrato automatiza la distribucion, protege los fondos,
> y cada pago puntual construye un Ayni Score — tu reputacion crediticia on-chain."

## MINUTO 1-2: Como funciona (Slide 4)

**Decir:**
> "El flujo es simple: creas un grupo, los miembros se unen,
> cada ronda todos aportan USDC, y el pozo se distribuye automaticamente
> al miembro de turno. Sin intermediarios. Sin confianza. Solo codigo."

## MINUTO 2-4: Demo en vivo

**Cambiar a avalayllu.vercel.app**

### Paso 1: Landing (10 seg)
> "Esta es nuestra app, deployada en Vercel, conectada a Avalanche Fuji."

### Paso 2: Dashboard (20 seg)
- Mostrar wallet conectada
- Mostrar balance USDC y Ayni Score
- Click "Obtener 1,000 USDC" (mostrar que es testnet)

### Paso 3: Explorar (15 seg)
- Click en "Explorar" en el navbar
- Mostrar ayllus abiertos y activos
- > "Cualquiera puede descubrir y unirse a un grupo."

### Paso 4: Crear Ayllu (30 seg)
- Click "Crear Ayllu"
- Llenar: nombre, 4 miembros, $50 USDC, 1 hora
- Confirmar en MetaMask
- > "En 2 segundos, el contrato esta deployado en Avalanche."
- Mostrar link a Snowscan

### Paso 5: Detalle de un Ayllu activo (30 seg)
- Ir a un ayllu que ya este ACTIVO (ej: /ayllu/4)
- Mostrar miembros, ronda actual, pozo
- Mostrar boton "Contribuir"
- > "Cuando todos contribuyen, el pozo se distribuye automaticamente.
>    Sin que nadie toque el dinero."

### Paso 6: Invitaciones (10 seg)
- Mostrar panel de invitacion con WhatsApp y copiar link
- > "Los creadores pueden invitar miembros por WhatsApp o compartir el link."

## MINUTO 4-5: Tech + Cierre (Slides 5-7)

**Volver a slides**

**Decir:**
> "Construido en Avalanche por su finalidad sub-segundo y gas ultra bajo.
> Una contribucion cuesta menos de un centavo en gas.
> Los contratos estan verificados en Snowscan, con 16 tests E2E pasando on-chain.
>
> El Ayni Score — nombrado por el principio andino de reciprocidad —
> puede convertirse en la puerta de entrada al sistema financiero formal
> para millones de personas.
>
> AvalAyllu: donde la reciprocidad andina se encuentra con la blockchain.
> Gracias."

---

## Preguntas frecuentes de jueces

**"Como manejan a alguien que no paga?"**
> El contrato registra pagos tardios en el Ayni Score. En la siguiente version,
> implementaremos un deposito de garantia (collateral) que se ejecuta automaticamente.

**"Por que no usan un ERC-4626 vault?"**
> El pasanaku no es un vault de rendimiento — es ahorro rotativo con distribucion
> secuencial. La logica es diferente: cada ronda tiene un unico beneficiario.

**"Cual es el modelo de negocio?"**
> Fee del 0.5% por distribucion de pozo. A $500B en ahorro informal,
> capturar el 0.1% del mercado = $250M en volumen = $1.25M en fees anuales.

**"Por que Avalanche y no Solana/Polygon?"**
> Finalidad sub-segundo nativa (no probabilistica), gas predecible,
> y la posibilidad de escalar a una subnet dedicada para LatAm con reglas locales.
