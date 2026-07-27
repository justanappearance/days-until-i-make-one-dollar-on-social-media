import { getStoredInstagramToken, saveInstagramToken } from './instagramToken.js'

async function refreshTokenIfNeeded(token) {
  const expiresAt = new Date(token.expires_at)
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  if (expiresAt > threeDaysFromNow) return token.access_token

  const url = new URL('https://graph.instagram.com/refresh_access_token')
  url.searchParams.set('grant_type', 'ig_refresh_token')
  url.searchParams.set('access_token', token.access_token)

  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Instagram token refresh failed: ${resp.status} ${await resp.text()}`)
  }

  const data = await resp.json()
  await saveInstagramToken(data.access_token, data.expires_in)
  return data.access_token
}

export async function fetchInstagramFollowerCount() {
  const stored = await getStoredInstagramToken()
  if (!stored) {
    throw new Error('Instagram not connected yet — visit /api/instagram-authorize to connect')
  }

  const accessToken = await refreshTokenIfNeeded(stored)

  const url = new URL('https://graph.instagram.com/me')
  url.searchParams.set('fields', 'followers_count')
  url.searchParams.set('access_token', accessToken)

  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Instagram API error: ${resp.status} ${await resp.text()}`)
  }

  const data = await resp.json()
  return Number(data.followers_count)
}
