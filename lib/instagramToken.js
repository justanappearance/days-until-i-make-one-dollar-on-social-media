export async function getStoredInstagramToken() {
  const resp = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/platform_tokens?platform=eq.instagram&select=access_token,expires_at`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  )
  if (!resp.ok) {
    throw new Error(`Failed to read Instagram token: ${resp.status} ${await resp.text()}`)
  }
  const rows = await resp.json()
  return rows[0] || null
}

export async function saveInstagramToken(accessToken, expiresInSeconds) {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString()

  const resp = await fetch(`${process.env.SUPABASE_URL}/rest/v1/platform_tokens`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ platform: 'instagram', access_token: accessToken, expires_at: expiresAt }),
  })

  if (!resp.ok) {
    throw new Error(`Failed to save Instagram token: ${resp.status} ${await resp.text()}`)
  }
}
