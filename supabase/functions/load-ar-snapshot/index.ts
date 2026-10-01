// DISABLED one-off loader. Used once on 2026-06-16 to load the June 15 AR snapshot.
// Neutralized afterward so it cannot be used to inject ar_source_rows via the public anon key.
Deno.serve(() => new Response(JSON.stringify({ error: "gone", detail: "one-off loader disabled after use" }), {
  status: 410, headers: { "Content-Type": "application/json" },
}));
