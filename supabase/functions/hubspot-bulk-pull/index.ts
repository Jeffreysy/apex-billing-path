import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PIPELINES: Record<string, string> = {
  INTAKE_TO_CASE: '2085892855',
  CASE:           '1104319199',
  COLLECTIONS:    '1933254359',
  NFS:            '2129032924',
}

const DEAL_PROPS = [
  'dealname', 'pipeline', 'dealstage', 'amount', 'closedate',
  'createdate', 'hs_lastmodifieddate',
  'mycase_case_id', 'mycase_id', 'case_id', 'case_number',
  'connector_name', 'connector_id',
  'consultation_fee', 'attorney', 'practice_area', 'payment_status',
]

const CONTACT_PROPS = ['email', 'phone', 'mobilephone', 'firstname', 'lastname']

interface PullRequest {
  pipelines?: string[]   // names from PIPELINES, default = all
  pipelineIds?: string[] // raw HubSpot pipeline IDs (overrides PIPELINES map)
  since?: string         // ISO timestamp; pulls hs_lastmodifieddate > since
  pageLimit?: number     // max pages per pipeline (safety cap), default 200
  runMatchAfter?: boolean // default true
  applyMatches?: boolean  // default true (auto-apply tier-A matches)
  discover?: boolean      // if true, returns pipelines + deal counts instead of pulling
}

async function listPipelines(token: string) {
  const res = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`pipelines list failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function countDealsInPipeline(token: string, pipelineId: string) {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'pipeline', operator: 'EQ', value: pipelineId }] }],
      properties:   ['dealname'],
      limit:        1,
    }),
  })
  if (!res.ok) return { total: -1, error: await res.text() }
  const data = await res.json()
  return { total: data.total ?? 0 }
}

async function searchDeals(token: string, pipelineId: string, since: string | undefined, after: string | undefined) {
  const filters: any[] = [
    { propertyName: 'pipeline', operator: 'EQ', value: pipelineId },
  ]
  if (since) {
    filters.push({ propertyName: 'hs_lastmodifieddate', operator: 'GTE', value: new Date(since).getTime() })
  }

  const body: any = {
    filterGroups: [{ filters }],
    properties:   DEAL_PROPS,
    limit:        100,
    sorts:        [{ propertyName: 'hs_lastmodifieddate', direction: 'ASCENDING' }],
  }
  if (after) body.after = after

  const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`HubSpot deal search failed [${pipelineId}]: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

// Search returns deal IDs only — fetch associations in batch for the page
async function batchReadDealAssociations(token: string, dealIds: string[]) {
  if (!dealIds.length) return new Map<string, string>()
  const res = await fetch(
    'https://api.hubapi.com/crm/v4/associations/deals/contacts/batch/read',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ inputs: dealIds.map(id => ({ id })) }),
    }
  )
  if (!res.ok) {
    console.error(`batch associations failed: ${res.status} ${await res.text()}`)
    return new Map<string, string>()
  }
  const data = await res.json()
  const out = new Map<string, string>()
  for (const r of data.results ?? []) {
    const dealId = String(r.from?.id ?? '')
    const contactId = r.to?.[0]?.toObjectId ?? r.to?.[0]?.id
    if (dealId && contactId) out.set(dealId, String(contactId))
  }
  return out
}

async function batchReadContacts(token: string, contactIds: string[]) {
  if (!contactIds.length) return new Map<string, any>()
  const res = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts/batch/read',
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        properties: CONTACT_PROPS,
        inputs:     contactIds.map(id => ({ id })),
      }),
    }
  )
  if (!res.ok) {
    console.error(`batch contacts failed: ${res.status} ${await res.text()}`)
    return new Map<string, any>()
  }
  const data = await res.json()
  const out = new Map<string, any>()
  for (const c of data.results ?? []) {
    out.set(String(c.id), c)
  }
  return out
}

function pickCaseId(props: Record<string, any>): string | null {
  return props.mycase_case_id || props.mycase_id || props.case_id || props.connector_id || null
}

function pickCaseNumber(props: Record<string, any>): string | null {
  return props.case_number || null
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const token = Deno.env.get('HUBSPOT_API_TOKEN')
  if (!token) {
    return new Response(JSON.stringify({ error: 'HUBSPOT_API_TOKEN not configured' }), { status: 500 })
  }

  let body: PullRequest = {}
  try { body = await req.json() } catch { /* empty body OK */ }

  // Discover mode: dump pipeline list + per-pipeline deal counts so we can fix stale IDs
  if (body.discover) {
    const pipelines = await listPipelines(token)
    const counts: any[] = []
    for (const p of pipelines.results ?? []) {
      const c = await countDealsInPipeline(token, p.id)
      counts.push({
        id:     p.id,
        label:  p.label,
        total_deals: c.total,
        stages: (p.stages ?? []).map((s: any) => ({ id: s.id, label: s.label })),
      })
    }
    return new Response(JSON.stringify({ ok: true, pipelines: counts }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build pipeline targets — pipelineIds takes priority over named pipelines
  const targetPipelines: { name: string; id: string }[] = []
  if (body.pipelineIds && body.pipelineIds.length) {
    for (const id of body.pipelineIds) targetPipelines.push({ name: id, id })
  } else {
    const names = (body.pipelines && body.pipelines.length ? body.pipelines : Object.keys(PIPELINES))
      .filter(p => PIPELINES[p])
    for (const n of names) targetPipelines.push({ name: n, id: PIPELINES[n] })
  }

  const since            = body.since
  const pageLimit        = body.pageLimit ?? 200
  const runMatchAfter    = body.runMatchAfter ?? true
  const applyMatches     = body.applyMatches ?? true

  const summary: Record<string, { pulled: number; pages: number; errors: number }> = {}

  for (const { name: pipelineName, id: pipelineId } of targetPipelines) {
    let after: string | undefined
    let pulled = 0, pages = 0, errors = 0

    while (pages < pageLimit) {
      let page: any
      try {
        page = await searchDeals(token, pipelineId, since, after)
      } catch (err) {
        errors++
        console.error(`[${pipelineName}] page ${pages}:`, err)
        break
      }
      pages++

      const deals: any[]    = page.results ?? []
      const dealIds         = deals.map(d => String(d.id))
      const dealToContact   = await batchReadDealAssociations(token, dealIds)
      const contactIds      = Array.from(new Set(Array.from(dealToContact.values())))
      const contactById     = await batchReadContacts(token, contactIds)

      const rows = deals.map(deal => {
        const props     = deal.properties ?? {}
        const dealId    = String(deal.id)
        const contactId = dealToContact.get(dealId) ?? null
        const cprops    = contactId ? (contactById.get(contactId)?.properties ?? {}) : {}
        return {
          hubspot_deal_id:     dealId,
          pipeline:            pipelineName,
          dealstage:           props.dealstage ?? null,
          dealname:            props.dealname ?? null,
          amount:              props.amount ? parseFloat(props.amount) : null,
          closedate:           props.closedate ?? null,
          createdate:          props.createdate ?? null,
          hs_lastmodifieddate: props.hs_lastmodifieddate ?? null,
          mycase_case_id:      pickCaseId(props),
          case_number:         pickCaseNumber(props),
          connector_name:      props.connector_name ?? null,
          primary_contact_id:  contactId,
          contact_email:       cprops.email ?? null,
          contact_phone:       cprops.phone ?? cprops.mobilephone ?? null,
          contact_firstname:   cprops.firstname ?? null,
          contact_lastname:    cprops.lastname ?? null,
          match_status:        'pending',
          payload:             props,
          pulled_at:           new Date().toISOString(),
          updated_at:          new Date().toISOString(),
        }
      })

      if (rows.length) {
        const { error } = await supabase
          .from('hubspot_deals_raw')
          .upsert(rows, { onConflict: 'hubspot_deal_id', ignoreDuplicates: false })
        if (error) {
          errors++
          console.error(`[${pipelineName}] upsert page ${pages}:`, error)
        } else {
          pulled += rows.length
        }
      }

      after = page.paging?.next?.after
      if (!after) break
    }

    summary[pipelineName] = { pulled, pages, errors }
  }

  let matchSummary: any = null
  if (runMatchAfter) {
    const { data, error } = await supabase.rpc('match_hubspot_deals', {
      p_apply: applyMatches,
    })
    matchSummary = error ? { error: error.message } : data
  }

  return new Response(
    JSON.stringify({ ok: true, summary, match: matchSummary }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
