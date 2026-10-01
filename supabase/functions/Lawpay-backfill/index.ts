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
    throw new Error(`LawPay API error: ${res.status} ${errText}`)
  }
  return res.json()
}

async function processTransaction(txn: any) {
  const lawpayId = txn.id
  const amount   = parseFloat(txn.amount || '0') / 100
  const payDate  = txn.created
    ? new Date(txn.created).toISOString().split('T')[0]
    : null

  if (!['AUTHORIZED', 'COMPLETED', 'SETTLED'].includes(txn.status)) {
    return 'skipped'
  }

  const payorName = (
    txn.method?.name ||
    txn.account_holder_name ||
    txn.description || ''
  ).trim()

  const invoiceRef = txn.reference?.includes('Invoice #')
    ? txn.reference.replace('Payment for Invoice #', '').trim()
    : null

  // ── Consultation payment ─────────────────────────────────
  const isConsultation = !invoiceRef && amount <= 300
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
        .from('clients')
        .select('id')
        .ilike('name', `%${payorName}%`)
        .limit(1)
        .single()
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

  // ── Check duplicate ──────────────────────────────────────
  const { data: existing } = await supabase
    .from('lawpay_transactions')
    .select('id')
    .eq('lawpay_transaction_id', lawpayId)
    .single()
  if (existing) return 'duplicate'

  // ── Client matching ──────────────────────────────────────
  let clientId:   string | null = null
  let contractId: string | null = null
  let confidence = 'unmatched'

  if (!clientId && payorName.length > 2) {
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
    const parts    = payorName.split(' ').filter((p: string) => p.length > 2)
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

  if (!clientId && invoiceRef) {
    const mycaseNum = parseFloat(invoiceRef)
    if (!isNaN(mycaseNum)) {
      const { data: c } = await supabase
        .from('clients').select('id')
        .eq('mycase_id', mycaseNum).single()
      if (c) { clientId = c.id; confidence = 'mycase_id_match' }
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

  // ── Insert lawpay transaction ────────────────────────────
  const { data: lawpayTxn } = await supabase
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
    .select().single()

  if (!clientId) {
    if (invoiceRef) {
      await supabase.from('lawpay_validation_log').insert({
        lawpay_txn_id: lawpayTxn?.id || null,
        issue_type:    'client_not_found',
        lawpay_amount: amount,
        lawpay_data:   txn,
      })
      return 'unmatched'
    }
    return 'skipped'
  }

  // ── Check existing payment ───────────────────────────────
  const { data: existingPmt } = await supabase
    .from('payments').select('id')
    .eq('client_id', clientId)
    .eq('payment_date', payDate)
    .eq('amount', amount).single()

  if (existingPmt) {
    await supabase.from('lawpay_transactions')
      .update({
        matched_to_payment: true,
        payment_id:         existingPmt.id,
        match_confidence:   'exact',
        processed_at:       new Date().toISOString(),
      })
      .eq('lawpay_transaction_id', lawpayId)
    return 'validated'
  }

  // ── Insert payment ───────────────────────────────────────
  const { data: newPmt } = await supabase
    .from('payments')
    .insert({
      payment_number:   `LP-${lawpayId}`,
      client_id:        clientId,
      amount:           amount,
      payment_date:     payDate,
      payment_method:   'credit_card',
      reference_number: lawpayId,
      notes:            `LawPay — ${txn.reference || payorName}`,
      payment_type:     'Installment',
      collector_name:   'LawPay Auto',
    })
    .select().single()

  if (contractId && newPmt) {
    const { data: co } = await supabase
      .from('contracts').select('collected, installments_paid, value')
      .eq('id', contractId).single()

    if (co) {
      const newCollected = (co.collected || 0) + amount
      const isFullyPaid  = newCollected >= co.value
      await supabase.from('contracts').update({
        collected:          newCollected,
        installments_paid:  (co.installments_paid || 0) + 1,
        delinquency_status: isFullyPaid ? 'Paid' : 'Current',
        days_out:           0,
        status:             isFullyPaid ? 'Paid' : undefined,
      }).eq('id', contractId)
    }

    await supabase.from('lawpay_transactions').update({
      matched_to_payment: true,
      payment_id:         newPmt.id,
      processed_at:       new Date().toISOString(),
    }).eq('lawpay_transaction_id', lawpayId)
  }

  await supabase.from('clients').update({
    delinquency_status: 'Current',
    days_past_due:      0,
  }).eq('id', clientId)

  return 'inserted'
}

Deno.serve(async (req) => {
  const body         = await req.json().catch(() => ({}))
  const start_page   = body.start_page  || 1
  const max_pages    = body.max_pages   || 50
  const page_size    = body.page_size   || 100

  console.log(`Starting full backfill from page ${start_page}, max ${max_pages} pages`)

  let totalInserted      = 0
  let totalDuplicates    = 0
  let totalUnmatched     = 0
  let totalValidated     = 0
  let totalSkipped       = 0
  let totalConsultations = 0
  let totalFetched       = 0
  let currentPage        = start_page
  let hasMore            = true
  let pagesProcessed     = 0

  while (hasMore && pagesProcessed < max_pages) {
    try {
      console.log(`Processing page ${currentPage}...`)

      const data = await fetchLawPay(
        '/v1/transactions',
        `?page=${currentPage}&page_size=${page_size}`
      )

      const transactions: any[] = data.results || data.transactions || []
      totalFetched += transactions.length

      if (transactions.length === 0) {
        hasMore = false
        break
      }

      for (const txn of transactions) {
        try {
          const result = await processTransaction(txn)
          if (result === 'inserted')      totalInserted++
          else if (result === 'duplicate') totalDuplicates++
          else if (result === 'unmatched') totalUnmatched++
          else if (result === 'validated') totalValidated++
          else if (result === 'skipped')   totalSkipped++
          else if (result === 'consultation') totalConsultations++
        } catch (txnErr: any) {
          console.error(`Error on txn ${txn?.id}:`, txnErr?.message)
        }
      }

      hasMore = transactions.length === page_size
      currentPage++
      pagesProcessed++

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))

    } catch (pageErr: any) {
      console.error(`Error on page ${currentPage}:`, pageErr?.message)
      break
    }
  }

  const summary = {
    pages_processed:      pagesProcessed,
    total_fetched:        totalFetched,
    inserted:             totalInserted,
    duplicates:           totalDuplicates,
    unmatched:            totalUnmatched,
    validated:            totalValidated,
    skipped:              totalSkipped,
    consultations_logged: totalConsultations,
    completed:            !hasMore,
    next_start_page:      hasMore ? currentPage : null,
  }

  console.log('Backfill complete:', JSON.stringify(summary))

  return new Response(
    JSON.stringify(summary),
    { headers: { 'Content-Type': 'application/json' } }
  )
})