export default function OceanSection({
  id,
  phase = 1,
  regional = false,
  profileDepth = 210,
}) {
  const salt = id === "halocline",
    enso = ["el-nino", "la-nina"].includes(id),
    nino = id === "el-nino",
    over = id === "overturning";
  const east = enso
    ? nino
      ? 190 + phase * 90
      : 190 - phase * 90
    : profileDepth;
  const up = id === "upwelling" || enso;
  return (
    <svg
      viewBox="0 0 800 470"
      className="section-svg"
      role="img"
      aria-label={
        salt
          ? "Perfil vertical de salinidad con cambio rápido entre capas"
          : "Sección oceánica con capas y movimiento del agua"
      }
    >
      <defs>
        <linearGradient id="water" x2="0" y2="1">
          <stop stopColor={salt ? "#91e5dd" : "#edb66e"} />
          <stop offset=".35" stopColor={salt ? "#5faaa9" : "#4caacb"} />
          <stop offset="1" stopColor={salt ? "#674da2" : "#10314e"} />
        </linearGradient>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 10 5 0 10" fill="#b9f8ff" />
        </marker>
      </defs>
      <text x="75" y="38" className="svg-title">
        {regional
          ? "COSTA PERUANA · VISTA REGIONAL"
          : enso
            ? "PACÍFICO ECUATORIAL · CORTE OESTE → ESTE"
            : over
              ? "ALTAS LATITUDES · INTERCAMBIO VERTICAL"
              : "COLUMNA DE AGUA · PERFIL VERTICAL"}
      </text>
      {id === "upwelling" && (
        <g>
          <path
            d="M660 95 L692 65"
            stroke="#d9e9ee"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <text x="590" y="22" className="svg-small">
            Viento paralelo a la costa ↗
          </text>
        </g>
      )}
      <path d="M80 120 650 120 710 85 145 85Z" fill="#2e6171" opacity=".6" />
      <rect
        x="80"
        y="120"
        width="570"
        height="280"
        fill="url(#water)"
        opacity=".8"
      />
      {!salt && (
        <path
          d={`M80 120 H650 V${east} Q365 ${enso ? 220 : 190} 80 ${enso ? 280 : 190}Z`}
          fill="#fb923c"
          opacity={0.22 + phase * 0.15}
        />
      )}
      <path
        d={`M80 ${enso ? 280 : profileDepth} Q365 ${enso ? 240 : profileDepth + 15} 650 ${east}`}
        fill="none"
        stroke={salt ? "#ceadff" : "#8ce6ed"}
        strokeWidth="3"
        strokeDasharray="7 5"
      />
      <path d="M80 120 H650" stroke="#a8f2ff" strokeWidth="3" />
      {[120, 210, 300, 400].map((y, i) => (
        <g key={y}>
          <text x="18" y={y + 4} className="svg-small">
            {["0", "100", "500", "1000"][i]}
          </text>
          <path d={`M65 ${y}h15`} stroke="#7c9fae" />
        </g>
      ))}
      <text x="18" y="445" className="svg-small">
        Profundidad conceptual (m) · no está a escala
      </text>
      <text x="105" y="150">
        {salt ? "Menor salinidad ··" : "Capa superficial relativamente cálida"}
      </text>
      <text x="105" y="370">
        {salt ? "Mayor salinidad ········" : "Agua profunda fría"}
      </text>
      {(up || over) && (
        <g className="flows" opacity={enso && nino ? 1 - phase * 0.65 : 1}>
          <path
            d={
              over
                ? "M420 150 Q610 150 600 280 Q590 350 310 350"
                : "M510 345 Q610 310 605 180 Q590 155 370 155"
            }
            fill="none"
            stroke="#b9f8ff"
            strokeWidth="4"
            markerEnd="url(#arrow)"
            strokeDasharray="12 8"
          />
          {!over && (
            <text x="395" y="335" className="svg-small">
              Agua subsuperficial ↑
            </text>
          )}
        </g>
      )}
      {up && (
        <>
          <path
            d="M590 65 H375"
            fill="none"
            stroke="#d9e9ee"
            strokeWidth={enso ? (nino ? 4 - phase * 2 : 2 + phase * 3) : 3}
            markerEnd="url(#arrow)"
          />
          <text x="390" y="57" className="svg-small">
            {enso ? "Viento hacia el oeste" : "Transporte mar adentro ←"}
          </text>
          <path d="M650 400V115L705 75V400Z" fill="#546b60" />
          <text x="657" y="435" className="svg-small">
            {enso ? "Sudamérica" : "Perú"}
          </text>
          {id === "upwelling" &&
            phase > 0.4 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                cx={535 + i * 15}
                cy={180 + (i % 2) * 12}
                r="3"
                fill="#b7ef93"
              />
            ))}
        </>
      )}
      {!up && !over && (
        <>
          <path d="M700 125 V390 M690 390H785" stroke="#769dab" fill="none" />
          <path
            d={
              salt
                ? `M718 135 L720 ${profileDepth - 20} Q720 ${profileDepth + 15} 765 ${profileDepth + 45} L768 380`
                : `M772 135 L770 ${profileDepth - 20} Q760 ${profileDepth + 15} 720 ${profileDepth + 45} L716 380`
            }
            fill="none"
            stroke={salt ? "#d3b8ff" : "#ffd29b"}
            strokeWidth="3"
          />
          <text x="697" y="105" className="svg-small">
            {salt ? "Salinidad →" : "Temp. →"}
          </text>
        </>
      )}
      {over && (
        <>
          <text x="450" y="185" className="svg-small">
            Fría + salina → más densa
          </text>
          <text x="430" y="300">
            Hundimiento ↓
          </text>
          <path
            d="M180 345 Q100 300 165 180"
            fill="none"
            stroke="#75cbd8"
            strokeDasharray="4 8"
            markerEnd="url(#arrow)"
          />
          <text x="95" y="320" className="svg-small">
            Mezcla y retorno
          </text>
        </>
      )}
    </svg>
  );
}
