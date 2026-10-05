export default function CivicEmblem({ className = "h-10 w-10" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Government of Tamil Nadu Emblem"
    >
      {/* Outer decorative ring */}
      <circle cx="50" cy="50" r="47" stroke="#0F2942" strokeWidth="2.5" fill="#FAFBFD" />
      <circle cx="50" cy="50" r="43" stroke="#D97706" strokeWidth="1" strokeDasharray="2 1.5" />
      <circle cx="50" cy="50" r="39" stroke="#0F2942" strokeWidth="1" />

      {/* Central shield/ground */}
      <path
        d="M26 68 L74 68 L68 76 L32 76 Z"
        fill="#0F2942"
      />

      {/* Temple Gopuram Silhouette (Tamil Nadu State Symbol) */}
      {/* Base tier */}
      <rect x="34" y="60" width="32" height="7" rx="1" fill="#0F2942" />
      {/* Tier 2 */}
      <rect x="36" y="52" width="28" height="7" rx="1" fill="#1E3A8A" />
      {/* Tier 3 */}
      <rect x="38" y="44" width="24" height="7" rx="1" fill="#0F2942" />
      {/* Tier 4 */}
      <rect x="41" y="37" width="18" height="6" rx="1" fill="#1E3A8A" />
      {/* Tier 5 */}
      <rect x="44" y="31" width="12" height="5" rx="1" fill="#0F2942" />
      {/* Kalasam / Pinnacles */}
      <polygon points="50,22 47,29 53,29" fill="#D97706" />
      <polygon points="44,25 42,30 46,30" fill="#D97706" />
      <polygon points="56,25 54,30 58,30" fill="#D97706" />

      {/* Decorative gopuram gateway cutout */}
      <path
        d="M47 67 A3 3 0 0 1 53 67 L53 60 L47 60 Z"
        fill="#FAFBFD"
      />

      {/* Wheat/Paddy stalks on left and right */}
      <path
        d="M22 62 C20 52 23 40 28 32"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="21" cy="58" r="1.5" fill="#D97706" />
      <circle cx="22" cy="50" r="1.5" fill="#D97706" />
      <circle cx="24" cy="42" r="1.5" fill="#D97706" />
      <circle cx="28" cy="34" r="1.5" fill="#D97706" />

      <path
        d="M78 62 C80 52 77 40 72 32"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="79" cy="58" r="1.5" fill="#D97706" />
      <circle cx="78" cy="50" r="1.5" fill="#D97706" />
      <circle cx="76" cy="42" r="1.5" fill="#D97706" />
      <circle cx="72" cy="34" r="1.5" fill="#D97706" />

      {/* Bottom text banner */}
      <path
        d="M30 81 Q50 85 70 81"
        stroke="#0F2942"
        strokeWidth="1"
        fill="none"
      />
      <text
        x="50"
        y="83"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="800"
        fill="#0F2942"
        fontFamily="sans-serif"
        letterSpacing="0.08em"
      >
        வாய்மையே வெல்லும்
      </text>
    </svg>
  );
}
