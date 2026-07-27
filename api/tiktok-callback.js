import { saveTikTokToken } from '../lib/tiktokToken.js'

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.TIKTOK_REDIRECT_URI,
  })

  const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!resp.ok) {
    throw new Error(`Code exchange failed: ${resp.status} ${await resp.text()}`)
  }

  return resp.json()
}

export default async function handler(req, res) {
  const { code, error } = req.query

  if (error) {
    return res.status(400).send(`TikTok authorization failed: ${error}`)
  }
  if (!code) {
    return res.status(400).send('Missing authorization code')
  }

  try {
    const token = await exchangeCodeForToken(code)
    await saveTikTokToken(token.access_token, token.refresh_token, token.expires_in)
    res.status(200).send('TikTok connected. You can close this tab.')
  } catch (e) {
    res.status(500).send(`Failed to connect TikTok: ${e.message}`)
  }
}
