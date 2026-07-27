export async function upsertStat(platform, count) {
  const today = new Date().toISOString().slice(0, 10)

  const resp = await fetch(`${process.env.SUPABASE_URL}/rest/v1/platform_stats`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ platform, date: today, count }),
  })

  if (!resp.ok) {
    throw new Error(`Failed to store ${platform} count: ${resp.status} ${await resp.text()}`)
  }
}
