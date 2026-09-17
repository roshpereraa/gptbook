export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="5" width="24" height="22" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 5v22" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="10.5" cy="13" r="1.8" fill="var(--accent)" />
      <circle cx="21.5" cy="13" r="1.8" fill="var(--accent)" />
      <path d="M8.5 19.5c1.2 1.3 2.9 1.3 4 0M19.5 19.5c1.2 1.3 2.9 1.3 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
