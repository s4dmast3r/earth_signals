export default function Storm({ phase, strength = 1 }) {
  return (
    <svg
      viewBox="0 0 800 470"
      className="section-svg"
      role="img"
      aria-label="Ciclón del hemisferio norte con bandas espirales, ojo y lluvia"
    >
      <defs>
        <radialGradient id="sea">
          <stop stopColor="#287380" />
          <stop offset="1" stopColor="#0a2538" />
        </radialGradient>
      </defs>
      <rect x="50" y="65" width="700" height="350" rx="180" fill="url(#sea)" />
      <text x="65" y="40" className="svg-title">
        ATLÁNTICO TROPICAL NORTE · VISTA REGIONAL
      </text>
      <g
        className="storm"
        style={{ transformOrigin: "400px 240px", opacity: 0.35 + phase * 0.65 }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 72} 400 240)`}>
            <path
              d="M424 234 C450 165 350 110 282 165 C210 225 260 340 365 350"
              fill="none"
              stroke="#d8f2f3"
              strokeWidth={10 + phase * 14 * strength}
              strokeLinecap="round"
              opacity=".72"
            />
            <path
              d="M445 250 C480 175 400 100 320 115"
              fill="none"
              stroke="#6ac9ec"
              strokeWidth="5"
              strokeDasharray="4 12"
            />
          </g>
        ))}
      </g>
      <circle cx="400" cy="240" r="21" fill="#0a3346" />
      <path d="M405 242 L560 305" stroke="#b4d8df" />
      <text x="565" y="314">
        Ojo
      </text>
      <text x="60" y="445" className="svg-small">
        ↺ Circulación antihoraria · nubes blancas · precipitación azul · océano
        cálido
      </text>
    </svg>
  );
}
