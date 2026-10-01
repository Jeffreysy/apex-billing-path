// ============================================================
// Supabase Edge Function: sync-zoom
// Syncs Zoom Phone call logs into collection_activities
// Deploy: supabase functions deploy sync-zoom
// Schedule: every 4 hours via Supabase cron
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID')!
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID')!
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Step 1: Get Zoom access token ────────────────────────────
async function getZoomToken(): Promise<string> {
  const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )
  const data = await res.json()
  if (!data.access_token) throw new Error(`Zoom auth failed: ${JSON.stringify(data)}`)
  return data.access_token
}

// ── Step 2: Fetch Zoom Phone call logs ───────────────────────
async function fetchCallLogs(token: string, from: string, to: string) {
  const allLogs: any[] = []
  let nextPageToken = ''

  do {
    const url = new URL('https://api.zoom.us/v2/phone/call_logs')
    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    url.searchParams.set('page_size', '300')
    url.searchParams.set('type', 'all')
    if (nextPageToken) url.searchParams.set('next_page_token', nextPageToken)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()

    if (data.call_logs) allLogs.push(...data.call_logs)
    nextPageToken = data.next_page_token || ''
  } while (nextPageToken)

  console.log(`Fetched ${allLogs.length} Zoom call logs`)
  return allLogs
}

// ── Step 3: Match call to client by phone number ─────────────
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

async function matchClientByPhone(phone: string): Promise<string | null> {
  const normalized = normalizePhone(phone)
  if (!normalized || normalized.length < 7) return null

  const { data } = await supabase
    .from('clients')
    .select('id, name, phone')
    .ilike('phone', `%${normalized}%`)
    .limit(1)
    .single()

  return data?.id || null
}

// ── Step 4: Map Zoom log to collection_activity row ──────────
function mapCallToActivity(log: any, clientId: string | null) {
  const startTime = new Date(log.date_time)
  const duration = log.duration || 0
  const endTime = new Date(startTime.getTime() + duration * 1000)

  const direction = log.direction === 'inbound' ? 'inbound' : 'outbound'
  const outcome = log.result === 'call_connected'
    ? 'Connected'
    : log.result === 'no_answer'
    ? 'No answer'
    : log.result === 'voicemail'
    ? 'Voicemail'
    : log.result || 'Unknown'

  const callerPhone = direction === 'inbound' ? log.caller_number : log.callee_number
  const callerName = direction === 'inbound' ? log.caller_name : log.callee_name

  return {
    client_id: clientId,
    client_name: callerName || callerPhone || 'Unknown',
    activity_type: 'call',
    activity_date: startTime.toISOString().split('T')[0],
    start_time: startTime.toTimeString().split(' ')[0],
    end_time: endTime.toTimeString().split(' ')[0],
    duration_minutes: Math.round(duration / 60 * 10) / 10,
    call_direction: direction,
    outcome: outcome,
    origin: 'zoom',
    transaction_id: log.id,
    notes: [
      log.caller_name && `Caller: ${log.caller_name}`,
      log.callee_name && `Callee: ${log.callee_name}`,
      log.caller_number && `From: ${log.caller_number}`,
      log.callee_number && `To: ${log.callee_number}`,
      log.recording_url && `Recording: ${log.recording_url}`,
    ].filter(Boolean).join(' | ') || null,
    collector: log.owner_name || null,
    weekday: startTime.toLocaleDateString('en-US', { weekday: 'long' }),
  }
}

// ── Step 5: Upsert into collection_activities ────────────────
async function upsertActivities(activities: any[]) {
  if (!activities.length) return 0

  const { data, error } = await supabase
    .from('collection_activities')
    .upsert(activities, {
      onConflict: 'transaction_id',
      ignoreDuplicates: false,
    })

  if (error) throw new Error(`Upsert failed: ${error.message}`)
  return activities.length
}

// ── Main handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    // Default: sync last 24 hours. Pass ?days=7 to backfill
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '1')

    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
    const fromStr = from.toISOString().split('T')[0]
    const toStr = to.toISOString().split('T')[0]

    console.log(`Syncing Zoom calls from ${fromStr} to ${toStr}`)

    // Get token
    const token = await getZoomToken()

    // Fetch call logs
    const logs = await fetchCallLogs(token, fromStr, toStr)
    if (!logs.length) {
      return new Response(JSON.stringify({ synced: 0, message: 'No calls in range' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Match clients and build activity rows
    const activities = []
    let matched = 0
    let unmatched = 0

    for (const log of logs) {
      // Try to match by callee (outbound) or caller (inbound)
      const matchPhone = log.direction === 'inbound' 
        ? log.caller_number 
        : log.callee_number

      const clientId = matchPhone ? await matchClientByPhone(matchPhone) : null
      if (clientId) matched++
      else unmatched++

      // Only skip if no transaction_id (can't upsert without it)
      if (!log.id) continue

      activities.push(mapCallToActivity(log, clientId))
    }

    // Upsert in batches of 100
    let totalSynced = 0
    for (let i = 0; i < activities.length; i += 100) {
      const batch = activities.slice(i, i + 100)
      totalSynced += await upsertActivities(batch)
    }

    const result = {
      synced: totalSynced,
      matched_to_client: matched,
      unmatched: unmatched,
      from: fromStr,
      to: toStr,
    }

    console.log('Zoom sync complete:', result)
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Zoom sync error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})