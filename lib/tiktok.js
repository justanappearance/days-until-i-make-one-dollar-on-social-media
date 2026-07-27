import { getStoredTikTokToken, saveTikTokToken } from './tiktokToken.js'

async function refreshTokenIfNeeded(token) {
  const expiresAt = new Date(token.expires_at)
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  if (expiresAt > threeDaysFromNow) return token.access_token

  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: token.refresh_token,
  })

  const resp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!resp.ok) {
    throw new Error(`TikTok token refresh failed: ${resp.status} ${await resp.text()}`)
  }

  const data = await resp.json()
  await saveTikTokToken(data.access_token, data.refresh_token, data.expires_in)
  return data.access_token
}

export async function fetchTiktokFollowerCount() {
  const stored = await getStoredTikTokToken()
  if (!stored) {
    throw new Error('TikTok not connected yet — visit /api/tiktok-authorize to connect')
  }

  const accessToken = await refreshTokenIfNeeded(stored)

  const url = new URL('https://open.tiktokapis.com/v2/user/info/')
  url.searchParams.set('fields', 'follower_count')

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!resp.ok) {
    throw new Error(`TikTok API error: ${resp.status} ${await resp.text()}`)
  }

  const data = await resp.json()
  return Number(data.data.user.follower_count)
}
