export function MiniMap() {
  return (
    <div className="mini-map" aria-hidden="true">
      <svg viewBox="0 0 220 170" role="img">
        <defs>
          <linearGradient id="mini-glow" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#89a957" stopOpacity="0.2" />
            <stop offset="1" stopColor="#d3aa41" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="204" height="154" rx="3" className="mini-grid" />
        <path
          className="mini-outline"
          d="M39 125 L52 74 L86 48 L105 31 L129 45 L147 42 L166 68 L174 101 L155 130 L119 139 L83 133 Z"
        />
        <path className="mini-river" d="M61 42 C80 64 86 86 109 97 C130 109 151 118 165 143" />
        <path className="mini-route" d="M42 126 C72 103 104 97 133 84 C153 75 165 65 176 52" />
        <g className="mini-focus">
          <rect x="139" y="86" width="43" height="42" rx="2" />
          <circle cx="160" cy="107" r="6" />
          <text x="160" y="135">
            PLEI ME
          </text>
        </g>
        <text x="28" y="103" className="mini-country">
          CAMPUCHIA
        </text>
        <text x="125" y="66" className="mini-country mini-country--right">
          VIỆT NAM
        </text>
      </svg>
    </div>
  );
}
