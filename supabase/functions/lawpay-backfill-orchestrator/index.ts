import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const BACKFILL_FUNC_URL = `${SUPABASE_URL}/functions/v1/sync-zoom`

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}))

  const total_pages = body.total_pages ?? 200
  const num_workers = Math.min(body.num_workers ?? 5, 10)
  const page_size   = body.page_size   ?? 100
  const start_page  = body.start_page  ?? 31
  const mode        = body.mode        ?? 'manual'

  const pages_per_worker = Math.ceil((total_pages - start_page + 1) / num_workers)
  const workers: { worker_id: string; start_page: number; end_page: number }[] = []

  for (let i = 0; i < num_workers; i++) {
    const wStart = start_page + i * pages_per_worker
    const wEnd   = Math.min(wStart + pages_per_worker - 1, total_pages)
    if (wStart > total_pages) break
    workers.push({ worker_id: `w${i + 1}`, start_page: wStart, end_page: wEnd })
  }

  console.log(`[orchestrator:${mode}] dispatching ${workers.length} workers, pages ${start_page}-${total_pages}`)

  await supabase.from('lawpay_backfill_progress').update({
    workers_dispatched: workers.length,
    total_pages,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('completed', false)

  const workerPromises = workers.map(async (w) => {
    const payload = {
      worker_id:  w.worker_id,
      start_page: w.start_page,
      end_page:   w.end_page,
      max_pages:  pages_per_worker + 5,
      page_size,
    }
    try {
      const res = await fetch(BACKFILL_FUNC_URL, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await res.json().catch(() => ({ error: 'parse error' }))
      return { ...w, status: res.ok ? 'ok' : 'error', result }
    } catch (err: any) {
      return { ...w, status: 'failed', error: err.message }
    }
  })

  const results = await Promise.allSettled(workerPromises)
  const summary = results.map(r =>
    r.status === 'fulfilled' ? r.value : { status: 'rejected', reason: r.reason }
  )

  const totals = summary.reduce((acc: any, w: any) => {
    if (w.result) {
      acc.inserted      += w.result.inserted             ?? 0
      acc.duplicates    += w.result.duplicates           ?? 0
      acc.unmatched     += w.result.unmatched            ?? 0
      acc.validated     += w.result.validated            ?? 0
      acc.consultations += w.result.consultations_logged ?? 0
      acc.fetched       += w.result.total_fetched        ?? 0
    }
    return acc
  }, { inserted: 0, duplicates: 0, unmatched: 0, validated: 0, consultations: 0, fetched: 0 })

  const allCompleted = summary.every((w: any) => w.result?.completed === true)

  if (allCompleted) {
    await supabase.from('lawpay_backfill_progress').update({
      completed:    true,
      completed_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }).eq('completed', false)
  }

  return new Response(JSON.stringify({
    mode,
    workers_dispatched: workers.length,
    worker_ranges:      workers,
    totals,
    all_completed:      allCompleted,
    worker_results:     summary,
  }), { headers: { 'Content-Type': 'application/json' } })
})