/**
 * Fabbio: mascota mini-robot amarillo animada (SVG puro + CSS).
 * @param {object} props
 * @param {number} [props.size=200] - Ancho en px (la altura es proporcional).
 * @param {boolean} [props.animated=true] - Activa las animaciones.
 * @param {string} [props.className]
 */
export function FabbioRobot({ size = 200, animated = true, className = '' }) {
  const a = (cls) => (animated ? cls : '');
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Fabbio, el asistente robot"
    >
      <defs>
        <linearGradient id="fabbioBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE066" />
          <stop offset="1" stopColor="#F5B700" />
        </linearGradient>
      </defs>

      {/* Sombra en el piso */}
      <ellipse cx="100" cy="210" rx="48" ry="8" fill="#000000" opacity="0.22" />

      <g className={a('animate-fabbio-float')}>
        {/* Antena */}
        <line x1="100" y1="42" x2="100" y2="20" stroke="#E0A800" strokeWidth="4" strokeLinecap="round" />
        <circle className={a('animate-fabbio-pulse')} cx="100" cy="15" r="6" fill="#FFD166" />

        {/* Brazo izquierdo (saluda) */}
        <g className={a('animate-fabbio-wave')} style={{ transformOrigin: '40px 126px' }}>
          <rect x="33" y="120" width="14" height="42" rx="7" fill="url(#fabbioBody)" stroke="#E0A800" strokeWidth="1.5" />
        </g>
        {/* Brazo derecho */}
        <rect x="153" y="120" width="14" height="42" rx="7" fill="url(#fabbioBody)" stroke="#E0A800" strokeWidth="1.5" />

        {/* Cuerpo */}
        <rect x="46" y="110" width="108" height="84" rx="26" fill="url(#fabbioBody)" stroke="#E0A800" strokeWidth="2" />
        <circle cx="100" cy="152" r="8" fill="#FFFFFF" opacity="0.85" />

        {/* Cabeza */}
        <rect x="40" y="46" width="120" height="76" rx="28" fill="url(#fabbioBody)" stroke="#E0A800" strokeWidth="2" />
        {/* Pantalla facial */}
        <rect x="56" y="58" width="88" height="52" rx="18" fill="#1F2937" />
        {/* Ojos (parpadean) */}
        <g className={a('animate-fabbio-blink')} style={{ transformOrigin: '100px 84px' }}>
          <circle cx="84" cy="84" r="8" fill="#FFE066" />
          <circle cx="116" cy="84" r="8" fill="#FFE066" />
        </g>
        {/* Sonrisa */}
        <path d="M86 98 q14 9 28 0" stroke="#FFE066" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Pies */}
        <rect x="64" y="190" width="26" height="13" rx="6" fill="#E0A800" />
        <rect x="110" y="190" width="26" height="13" rx="6" fill="#E0A800" />
      </g>
    </svg>
  );
}
