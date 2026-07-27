export default function handler(req, res) {
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
  url.searchParams.set('client_key', process.env.TIKTOK_CLIENT_KEY)
  url.searchParams.set('redirect_uri', process.env.TIKTOK_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'user.info.basic,user.info.stats')
  url.searchParams.set('state', 'social_stats')
  res.redirect(302, url.toString())
}
