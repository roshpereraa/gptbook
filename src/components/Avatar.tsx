export function Avatar({ emoji, color, size = 28 }: { emoji: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)`,
      }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
