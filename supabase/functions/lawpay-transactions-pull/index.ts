import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LAWPAY_SECRET = Deno.env.get('LAWPAY_SECRET_KEY')!
const LAWPAY_BASE   = 'https://api.affinipay.com'

async function fetchLawPay(endpoint: string, params = '') {
  const credentials = btoa(`${LAWPAY_SECRET}:`)
  const res = await fetch(`${LAWPAY_BASE}${endpoint}${params}`, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/json',
    }
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`LawPay API ${res.status}: ${errText}`)
  }
  return res.json()
}

async function processTransaction(txn: any): Promise<string> {
  const lawpayId = txn.id
  const amount   = parseFloat(txn.amount || '0') / 100
  const payDate  = txn.created
    ? new Date(txn.created).toISOString().split('T')[0]
    : null

  if (!['AUTHORIZED', 'COMPLETED', 'SETTLED'].includes(txn.status)) {
    return 'skipped_status'
  }

  // Check duplicate
  const { data: existing } = await supabase
    .from('lawpay_transactions')
    .select('id')
    .eq('lawpay_transaction_id', lawpayId)
    .single()
  if (existing) return 'duplicate'

  const payorName = (
    txn.method?.name ||
    txn.account_holder_name ||
    txn.description || ''
  ).trim()

  const invoiceRef = txn.reference?.includes('Invoice #')
    ? txn.reference.replace('Payment for Invoice #', '').trim()
    : null

  const isConsultation = !invoiceRef && amount <= 300 && amount > 0

  // Consultation path
  if (isConsultation) {
    const { data: existingConsult } = await supabase
      .from('consultations')
      .select('id')
      .eq('lawpay_transaction_id', lawpayId)
      .single()
    if (existingConsult) return 'duplicate'

    let existingClientId = null
    if (payorName.length > 2) {
      const { data: ec } = await supabase
        .from('clients').select('id')
        .ilike('name', `%${payorName}%`)
        .limit(1).single()
      if (ec) existingClientId = ec.id
    }

    await supabase.from('consultations').insert({
      lawpay_transaction_id: lawpayId,
      potential_client_name: payorName,
      email:                 txn.method?.email || null,
      amount_paid:           amount,
      payment_date:          payDate,
      payment_method:        txn.method?.type || 'card',
      card_last_four:        txn.method?.number?.slice(-4) || null,
      status:                'paid',
      converted_to_client:   existingClientId !== null,
      client_id:             existingClientId,
      converted_at:          existingClientId ? new Date().toISOString() : null,
      raw_payload:           txn,
    })
    return 'consultation'
  }

  // Client matching
  let clientId:   string | null = null
  let contractId: string | null = null
  let confidence = 'unmatched'

  if (payorName.length > 2) {
    const { data: c } = await supabase
      .from('clients').select('id')
      .ilike('name', payorName).limit(1).single()
    if (c) { clientId = c.id; confidence = 'exact' }
  }

  if (!clientId && payorName.length > 2) {
    const { data: c } = await supabase
      .from('clients').select('id')
      .ilike('name', `%${payorName}%`).limit(1).single()
    if (c) { clientId = c.id; confidence = 'name_match' }
  }

  if (!clientId && payorName.length > 2) {
    const parts = payorName.split(' ').filter((p: string) => p.length > 2)
    const lastName = parts[parts.length - 1]
    if (lastName) {
      const { data: c } = await supabase
        .from('clients').select('id')
        .ilike('name', `%${lastName}%`).limit(1).single()
      if (c) { clientId = c.id; confidence = 'last_name_match' }
    }
  }

  if (!clientId && invoiceRef) {
    const { data: co } = await supabase
      .from('contracts').select('id, client_id')
      .eq('case_number', invoiceRef).single()
    if (co?.client_id) {
      clientId = co.client_id; contractId = co.id
      confidence = 'invoice_match'
    }
  }

  if (clientId && !contractId) {
    const { data: co } = await supabase
      .from('contracts').select('id')
      .eq('client_id', clientId)
      .in('status', ['Active', 'Risk'])
      .order('created_at', { ascending: false })
      .limit(1).single()
    if (co) contractId = co.id
  }

  // Insert lawpay transaction
  await supabase
    .from('lawpay_transactions')
    .insert({
      lawpay_transaction_id: lawpayId,
      client_id:             clientId,
      contract_id:           contractId,
      amount:                amount,
      status:                txn.status,
      payment_method:        txn.method?.type || 'card',
      card_last_four:        txn.method?.number?.slice(-4) || null,
      card_brand:            txn.method?.card_type || null,
      payment_date:          payDate,
      description:           txn.reference || payorName || null,
      match_confidence:      confidence,
      matched_to_payment:    false,
      raw_payload:           txn,
    })

  return clientId ? 'inserted_matched' : 'inserted_unmatched'
}

// Pages from newest, stops when it hits consecutive duplicates
async function catchUp(
  maxPages: number,
  pageSize: number,
  dupStopThreshold: number,
  dryRun: boolean
) {
  let currentPage = 1
  let consecutiveDupPages = 0
  const stats = {
    pages_processed: 0,
    total_fetched: 0,
    inserted_matched: 0,
    inserted_unmatched: 0,
    consultations: 0,
    duplicates: 0,
    skipped: 0,
    errors: 0,
    error_samples: [] as string[],
    date_range_seen: { earliest: '', latest: '' },
    stopped_reason: '',
  }

  while (currentPage <= maxPages) {
    try {
      console.log(`[page ${currentPage}] fetching...`)
      const data = await fetchLawPay('/v1/transactions', `?page=${currentPage}&page_size=${pageSize}`)
      const transactions: any[] = data.results || []
      stats.total_fetched += transactions.length

      if (transactions.length === 0) {
        stats.stopped_reason = 'no_more_data'
        break
      }

      let pageDups = 0

      for (const txn of transactions) {
        // Track date range
        const txnDate = txn.created ? new Date(txn.created).toISOString().split('T')[0] : ''
        if (txnDate) {
          if (!stats.date_range_seen.latest || txnDate > stats.date_range_seen.latest)
            stats.date_range_seen.latest = txnDate
          if (!stats.date_range_seen.earliest || txnDate < stats.date_range_seen.earliest)
            stats.date_range_seen.earliest = txnDate
        }

        if (dryRun) {
          // In dry run, just check duplicates
          const { data: existing } = await supabase
            .from('lawpay_transactions')
            .select('id')
            .eq('lawpay_transaction_id', txn.id)
            .single()
          if (existing) {
            stats.duplicates++
            pageDups++
          } else {
            stats.inserted_matched++ // count as would-insert
          }
          continue
        }

        try {
          const result = await processTransaction(txn)
          if (result === 'duplicate')           { stats.duplicates++; pageDups++ }
          else if (result === 'inserted_matched')   stats.inserted_matched++
          else if (result === 'inserted_unmatched') stats.inserted_unmatched++
          else if (result === 'consultation')       stats.consultations++
          else if (result === 'skipped_status')     stats.skipped++
        } catch (txnErr: any) {
          stats.errors++
          if (stats.error_samples.length < 5) {
            stats.error_samples.push(`${txn?.id}: ${txnErr?.message?.substring(0, 120)}`)
          }
        }
      }

      stats.pages_processed++

      // If entire page was duplicates, increment stop counter
      if (pageDups === transactions.length) {
        consecutiveDupPages++
        console.log(`[page ${currentPage}] all ${pageDups} duplicates (${consecutiveDupPages}/${dupStopThreshold} consecutive)`)
        if (consecutiveDupPages >= dupStopThreshold) {
          stats.stopped_reason = `hit ${dupStopThreshold} consecutive all-duplicate pages`
          break
        }
      } else {
        consecutiveDupPages = 0
      }

      currentPage++
      await new Promise(r => setTimeout(r, 200))

    } catch (pageErr: any) {
      stats.errors++
      stats.stopped_reason = `page_error: ${pageErr?.message?.substring(0, 100)}`
      if (stats.error_samples.length < 5) {
        stats.error_samples.push(`page ${currentPage}: ${pageErr?.message?.substring(0, 120)}`)
      }
      break
    }
  }

  if (!stats.stopped_reason && currentPage > maxPages) {
    stats.stopped_reason = `reached max_pages limit (${maxPages})`
  }

  return stats
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}))
    const mode = body.mode || 'dry_run'

    // Shared params
    const maxPages         = body.max_pages          || 200
    const pageSize         = body.page_size          || 100
    const dupStopThreshold = body.dup_stop_threshold || 3

    if (mode === 'dry_run') {
      console.log(`[dry_run] max_pages=${maxPages} page_size=${pageSize} dup_stop=${dupStopThreshold}`)
      const result = await catchUp(maxPages, pageSize, dupStopThreshold, true)
      return new Response(JSON.stringify({ mode: 'dry_run', ...result }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (mode === 'live') {
      console.log(`[LIVE] max_pages=${maxPages} page_size=${pageSize} dup_stop=${dupStopThreshold}`)
      const result = await catchUp(maxPages, pageSize, dupStopThreshold, false)
      return new Response(JSON.stringify({ mode: 'live', ...result }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Quick probe
    if (mode === 'probe') {
      const data = await fetchLawPay('/v1/transactions', '?page=1&page_size=3')
      return new Response(JSON.stringify({
        total_entries: data.total_entries,
        newest_3: (data.results || []).map((t: any) => ({
          id: t.id,
          created: t.created,
          amount: t.amount / 100,
          status: t.status,
          reference: t.reference,
          name: t.method?.name || t.description,
        }))
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Use mode: probe, dry_run, or live' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Fatal:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})