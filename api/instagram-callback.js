import { saveInstagramToken } from '../lib/instagramToken.js'

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID,
    client_secret: process.env.INSTAGRAM_APP_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
    code,
  })

  const resp = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body,
  })

  if (!resp.ok) {
    throw new Error(`Code exchange failed: ${resp.status} ${await resp.text()}`)
  }

  return resp.json()
}

async function exchangeForLongLivedToken(shortLivedToken) {
  const url = new URL('https://graph.instagram.com/access_token')
  url.searchParams.set('grant_type', 'ig_exchange_token')
  url.searchParams.set('client_secret', process.env.INSTAGRAM_APP_SECRET)
  url.searchParams.set('access_token', shortLivedToken)

  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Long-lived token exchange failed: ${resp.status} ${await resp.text()}`)
  }

  return resp.json()
}

export default async function handler(req, res) {
  const { code, error } = req.query

  if (error) {
    return res.status(400).send(`Instagram authorization failed: ${error}`)
  }
  if (!code) {
    return res.status(400).send('Missing authorization code')
  }

  try {
    const shortLived = await exchangeCodeForToken(code)
    const longLived = await exchangeForLongLivedToken(shortLived.access_token)
    await saveInstagramToken(longLived.access_token, longLived.expires_in)
    res.status(200).send('Instagram connected. You can close this tab.')
  } catch (e) {
    res.status(500).send(`Failed to connect Instagram: ${e.message}`)
  }
}
