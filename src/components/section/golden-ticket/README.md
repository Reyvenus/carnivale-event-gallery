# Golden Ticket Component

Componente de React que muestra un botón dorado estilo "Willy Wonka" que al hacer clic abre un modal con un ticket dorado animado y efectos de confetti.

## 🎫 Características

- ✨ Animación de entrada con efecto de flotación
- 🎉 Efectos de confetti continuo con canvas-confetti
- 📱 Totalmente responsivo
- ⌨️ Cierre con tecla ESC
- 🖱️ Cierre al hacer clic fuera del ticket
- 🎨 Diseño personalizable inspirado en los Golden Tickets de Wonka

## 📦 Instalación

El componente requiere la librería `canvas-confetti`:

\`\`\`bash
npm install canvas-confetti
\`\`\`

## 🚀 Uso Básico

\`\`\`jsx
import GoldenTicket from './components/section/golden-ticket';

function MyComponent() {
  return (
    <div>
      <GoldenTicket guestName="Coco e Ivi" />
    </div>
  );
}
\`\`\`

## 🎛️ Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| \`guestName\` | \`string\` | \`"María & Juan García"\` | Nombre del invitado que aparece en el ticket |

## 📝 Ejemplo Completo

\`\`\`jsx
import GoldenTicket from './components/section/golden-ticket';

export default function WeddingInvitation() {
  return (
    <div className="invitation">
      {/* Otros componentes */}
      
      {/* Golden Ticket antes de la sección de deseos */}
      <GoldenTicket guestName="Bruno e Ivana" />
      
      {/* Sección de deseos */}
      <WishSection />
    </div>
  );
}
\`\`\`

## 🎨 Personalización

### Modificar Información del Ticket

Para cambiar la información del ticket (fecha, hora, lugar), edita directamente el componente:

\`\`\`jsx
// src/components/section/golden-ticket/index.jsx

<div className="info-item">
  <p className="info-label">FECHA</p>
  <p className="info-value">24 DE ENERO, 2026</p>  {/* Cambiar aquí */}
</div>
<div className="info-item">
  <p className="info-label">HORA</p>
  <p className="info-value">4:00 PM</p>  {/* Cambiar aquí */}
</div>
<div className="info-item">
  <p className="info-label">LUGAR</p>
  <p className="info-value">SALÓN WONKA</p>  {/* Cambiar aquí */}
</div>
\`\`\`

### Modificar Estilos

Los estilos están en \`src/components/section/golden-ticket/styles.css\`. Puedes personalizar:

- Colores del gradiente dorado
- Tamaño del ticket
- Fuentes
- Animaciones
- Efectos de confetti

### Cambiar Colores del Confetti

En el componente, busca las funciones \`startContinuousConfetti\` y modifica el array \`colors\`:

\`\`\`jsx
colors: ['#d4af37', '#f0db7d', '#c9a961', '#f4e4b0', '#b8860b']
\`\`\`

## 🎭 Animaciones

El componente incluye:

1. **Animación de entrada**: El ticket aparece con efecto de escala
2. **Animación de flotación**: El ticket flota constantemente
3. **Efecto shine**: Brillo que atraviesa el ticket periódicamente
4. **Confetti continuo**: Partículas doradas cayendo desde ambos lados

## 📱 Responsividad

El componente es completamente responsivo:

- En pantallas pequeñas (< 400px): El ticket se reduce automáticamente
- El modal se adapta a cualquier tamaño de pantalla
- El botón mantiene proporciones adecuadas en todos los dispositivos

## 🔧 Estructura de Archivos

\`\`\`
golden-ticket/
├── index.jsx       # Componente principal
├── styles.css      # Estilos del componente
└── README.md       # Esta documentación
\`\`\`

## 🎯 Integración en el Proyecto

El componente ya está integrado en \`detail-info/index.jsx\` justo antes de la sección de deseos:

\`\`\`jsx
{/* Golden Ticket Button */}
<GoldenTicket guestName="Coco e Ivi" />

{data.show_menu.wish && import.meta.env.VITE_APP_TABLE_NAME ? (
  <WishSection />
) : null}
\`\`\`

## 🐛 Solución de Problemas

### El confetti no aparece
- Verifica que \`canvas-confetti\` esté instalado: \`npm list canvas-confetti\`
- Revisa la consola del navegador para errores

### El modal no se cierra
- Verifica que no haya errores de JavaScript
- Intenta presionar ESC o hacer clic en la X

### Los estilos no se aplican
- Asegúrate de que \`styles.css\` esté importado en el componente
- Verifica que no haya conflictos con otros estilos globales

## 📄 Licencia

Este componente es parte del proyecto de invitación de boda y puede ser usado y modificado libremente.

## 👥 Créditos

- Inspirado en los Golden Tickets de "Charlie y la Fábrica de Chocolate"
- Efectos de confetti con [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- Fuentes: [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) y [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
