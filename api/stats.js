export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const resp = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/platform_stats?select=platform,date,count&order=date.asc`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  )

  if (!resp.ok) {
    return res.status(500).json({ error: 'Database error' })
  }

  res.status(200).json(await resp.json())
}
