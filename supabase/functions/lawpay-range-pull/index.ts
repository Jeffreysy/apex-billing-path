// lawpay-range-pull v5 (raw mode gains full-object dump for payload forensics)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const LAWPAY_SECRET = Deno.env.get('LAWPAY_SECRET_KEY')!
const LAWPAY_BASE = 'https://api.affinipay.com'
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o, null, 2), { status, headers: { 'Content-Type': 'application/json' } })
async function fetchLawPay(endpoint: string, params = '') {
  const res = await fetch(`${LAWPAY_BASE}${endpoint}${params}`, { headers: { 'Authorization': `Basic ${btoa(LAWPAY_SECRET + ':')}`, 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(`LawPay API ${res.status}: ${(await res.text()).slice(0, 240)}`)
  return res.json()
}
Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({} as any))
    const mode = body.mode || 'probe'
    if (mode === 'probe') { const d = await fetchLawPay('/v1/transactions', '?page=1&page_size=3'); return json({ total_entries: d.total_entries }) }
    if (mode === 'dump') {
      // pull recent pages, return FULL objects whose reference lacks 'Invoice #' (bare-class forensics)
      const maxPages = body.max_pages || 5
      const found: any[] = []
      for (let p = 1; p <= maxPages && found.length < (body.limit || 4); p++) {
        const d = await fetchLawPay('/v1/transactions', `?page=${p}&page_size=100`)
        for (const t of (d.results || [])) {
          const ref = t.reference || ''
          if (t.type === 'CHARGE' && !/Invoice\s*#/i.test(ref) && ref.trim() !== '') { found.push(t); if (found.length >= (body.limit || 4)) break }
        }
      }
      return json({ mode: 'dump', found_count: found.length, objects: found })
    }
    return json({ error: 'use mode probe|dump' }, 400)
  } catch (e: any) { return json({ error: e.message }, 500) }
})
