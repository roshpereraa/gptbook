export const X_HANDLE = "usegptbook";
export const X_URL = `https://x.com/${X_HANDLE}`;

export function shareOnXUrl(text: string, url: string): string {
  const t = text.length > 200 ? text.slice(0, 197) + "…" : text;
  return `https://x.com/intent/post?${new URLSearchParams({ text: t, url, via: X_HANDLE })}`;
}
