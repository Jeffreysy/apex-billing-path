import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Pipeline IDs from HubSpot (Elizabeth Rosario Law)
const PIPELINES = {
  INTAKE_TO_CASE: '2085892855',
  SALES:          'default',
  CASE:           '1104319199',
  COLLECTIONS:    '1933254359',
  NFS:            '2129032924',
}

const CASE_STAGE_LABELS: Record<string, string> = {
  '3299873478': 'Intake Scheduled',
  '3299873479': 'Consultation Scheduled',
  '3299873480': 'Intake Completed',
  '3299873481': 'Consultation Completed',
  '3299873482': 'Follow Up - Ready To Retain',
  '3299873483': 'Attorney Review',
  '3299873484': 'Case Won',
  '3299873485': 'Case Lost',
  '3372468959': 'NFS',
  '1738591944': 'Closed Won',
  '1738591945': 'Closed Lost',
  '1738591943': 'Contract Sent',
}

const COLLECTIONS_STAGE_MAP: Record<string, string> = {
  '3067194068': 'Past Due <7',
  '3067194069': 'Past Due 7-30',
  '3067194070': 'Past Due 30-90',
  '3067194071': 'Past Due 90+',
  '3067194072': 'Current',
  '3067194074': 'Delinquent',
}

async function fetchDeal(dealId: string, token: string) {
  const props = [
    'dealname', 'pipeline', 'dealstage', 'amount', 'closedate',
    'consultation_date', 'consultation_fee', 'consult_specialist',
    'attorney', 'intaker', 'payment_status', 'phone_number',
    'lead_priority', 'unqualified_reason', 'connector_name',
    'dealtype', 'createdate', 'hs_lastmodifieddate',
  ].join(',')

  const res = await fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${props}&associations=contacts`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`HubSpot fetch failed: ${res.status}`)
  return res.json()
}

async function handleIntakeToCase(supabase: any, deal: any, log: any) {
  const props = deal.properties
  const hubspotDealId = String(deal.id)
  const stageLabel = CASE_STAGE_LABELS[props.dealstage] ?? props.dealstage

  // Try to match existing client by name
  const nameParts = (props.dealname ?? '').replace(/^Lead - /i, '').trim().split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  let clientId: string | null = null

  if (firstName) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', `%${firstName}%${lastName ? '%' + lastName + '%' : ''}`)
      .limit(1)
      .single()

    if (existing) {
      clientId = existing.id
      await supabase
        .from('clients')
        .update({ hubspot_deal_id: hubspotDealId })
        .eq('id', clientId)
    }
  }

  const { error } = await supabase
    .from('consults')
    .upsert({
      hubspot_deal_id:   hubspotDealId,
      client_id:         clientId,
      dealname:          props.dealname,
      consultation_date: props.consultation_date ?? null,
      consultation_fee:  props.consultation_fee ? parseFloat(props.consultation_fee) : null,
      consult_specialist: props.consult_specialist ?? null,
      attorney:          props.attorney ?? null,
      intaker:           props.intaker ?? null,
      pipeline:          props.pipeline,
      stage:             props.dealstage,
      stage_label:       stageLabel,
      payment_status:    props.payment_status ?? null,
      phone_number:      props.phone_number ?? null,
      lead_priority:     props.lead_priority ?? null,
      unqualified_reason: props.unqualified_reason ?? null,
      converted_to_case: ['3299873484'].includes(props.dealstage), // Case Won
      hubspot_created_at: props.createdate,
      hubspot_updated_at: props.hs_lastmodifieddate,
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'hubspot_deal_id' })

  // Forward-catch: when a deal transitions to Case Won, run the LawPay-gated
  // promotion (cohort 1-5 logic) so the client lands in LexCollect with the
  // right client_quality_status and a downpayment-confirmed flag.
  let promotion: any = null
  if (props.dealstage === '3299873484') {
    // Pull associated contact for richer match signals
    const contactId = deal.associations?.contacts?.results?.[0]?.id
    let contactProps: any = {}
    if (contactId) {
      try {
        const cRes = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=email,phone,mobilephone,firstname,lastname`,
          { headers: { Authorization: `Bearer ${Deno.env.get('HUBSPOT_API_TOKEN')!}` } }
        )
        if (cRes.ok) contactProps = (await cRes.json()).properties ?? {}
      } catch (_) { /* non-fatal */ }
    }

    const { data: promo, error: promoErr } = await supabase.rpc('promote_hubspot_case_won_deal', {
      p_hubspot_deal_id:   hubspotDealId,
      p_dealname:          props.dealname ?? '',
      p_contact_email:     contactProps.email ?? null,
      p_contact_phone:     contactProps.phone ?? contactProps.mobilephone ?? props.phone_number ?? null,
      p_contact_firstname: contactProps.firstname ?? null,
      p_contact_lastname:  contactProps.lastname ?? null,
    })
    promotion = promoErr ? { error: promoErr.message } : promo
  }

  return {
    event_type:   'consult_upsert',
    matched:      !error,
    match_detail: error
      ? error.message
      : `stage: ${stageLabel}, client_match: ${!!clientId}` +
        (promotion ? `, promotion: ${JSON.stringify(promotion)}` : ''),
  }
}

async function handleCase(supabase: any, deal: any) {
  const props = deal.properties
  const hubspotDealId = String(deal.id)
  const stageLabel = CASE_STAGE_LABELS[props.dealstage] ?? props.dealstage

  // Look up contract by hubspot_deal_id or try to match by client name
  const { data: contract } = await supabase
    .from('contracts')
    .select('id, client, status')
    .eq('hubspot_deal_id', hubspotDealId)
    .single()

  if (contract) {
    // Update stage tracking
    await supabase
      .from('contracts')
      .update({
        hubspot_pipeline:     props.pipeline,
        hubspot_stage:        props.dealstage,
        hubspot_validated_at: new Date().toISOString(),
      })
      .eq('id', contract.id)

    // If Case Won → ensure status is Active
    if (props.dealstage === '1738591944') {
      await supabase
        .from('contracts')
        .update({ status: 'Active' })
        .eq('id', contract.id)

      // Mark consult as converted if it exists
      await supabase
        .from('consults')
        .update({
          converted_to_case:     true,
          converted_contract_id: contract.id,
          converted_at:          new Date().toISOString(),
        })
        .eq('hubspot_deal_id', hubspotDealId)
    }

    return {
      event_type:   'case_validate',
      matched:      true,
      match_detail: `contract matched, stage: ${stageLabel}`,
    }
  }

  return {
    event_type:   'case_validate',
    matched:      false,
    match_detail: `no contract found for deal ${hubspotDealId} — needs manual match`,
  }
}

async function handleCollections(supabase: any, deal: any) {
  const props = deal.properties
  const hubspotDealId = String(deal.id)
  const delinquencyStatus = COLLECTIONS_STAGE_MAP[props.dealstage]

  const { data: contract } = await supabase
    .from('contracts')
    .select('id')
    .eq('hubspot_deal_id', hubspotDealId)
    .single()

  if (!contract) {
    return {
      event_type:   'collections_update',
      matched:      false,
      match_detail: `no contract found for collections deal ${hubspotDealId}`,
    }
  }

  if (!delinquencyStatus) {
    return {
      event_type:   'collections_update',
      matched:      true,
      match_detail: `contract found but stage ${props.dealstage} has no delinquency mapping — skipped update`,
    }
  }

  await supabase
    .from('contracts')
    .update({
      delinquency_status:   delinquencyStatus,
      hubspot_stage:        props.dealstage,
      hubspot_validated_at: new Date().toISOString(),
    })
    .eq('id', contract.id)

  return {
    event_type:   'collections_update',
    matched:      true,
    match_detail: `delinquency → ${delinquencyStatus}`,
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const hubspotToken = Deno.env.get('HUBSPOT_API_TOKEN')!

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  // HubSpot sends an array of events
  const events = Array.isArray(body) ? body : [body]
  const results = []

  for (const event of events) {
    const dealId = String(event.objectId ?? event.dealId ?? event.id)
    if (!dealId) continue

    let deal: any
    try {
      deal = await fetchDeal(dealId, hubspotToken)
    } catch (err) {
      results.push({ dealId, error: String(err) })
      continue
    }

    const pipeline = deal.properties?.pipeline
    let result: any

    if (pipeline === PIPELINES.INTAKE_TO_CASE) {
      result = await handleIntakeToCase(supabase, deal, event)
    } else if (pipeline === PIPELINES.CASE || pipeline === PIPELINES.NFS) {
      result = await handleCase(supabase, deal)
    } else if (pipeline === PIPELINES.COLLECTIONS) {
      result = await handleCollections(supabase, deal)
    } else {
      result = {
        event_type:   'unmatched',
        matched:      false,
        match_detail: `unknown pipeline: ${pipeline}`,
      }
    }

    // Log every event
    await supabase.from('hubspot_sync_log').insert({
      hubspot_deal_id: dealId,
      pipeline,
      stage:        deal.properties?.dealstage,
      event_type:   result.event_type,
      matched:      result.matched,
      match_detail: result.match_detail,
      payload:      deal.properties,
    })

    results.push({ dealId, ...result })
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
