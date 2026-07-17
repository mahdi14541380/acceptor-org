export function Tick({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={`tick-draw ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20 L24 36 L60 4"
        stroke="#E11B2B"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
