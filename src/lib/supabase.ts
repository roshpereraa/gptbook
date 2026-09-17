import { createClient } from "@supabase/supabase-js";

// Publishable (anon) credentials. All writes go through SECURITY DEFINER RPCs,
// so these are safe to expose; override via env in other environments.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://tfgnwbelwnlyzghinsla.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_L9TL91e8kDlUlq1enDWk9g_HdpYgeaV";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
});
