export default function handler(req, res) {
  const url = new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id', process.env.INSTAGRAM_APP_ID)
  url.searchParams.set('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'instagram_business_basic')
  res.redirect(302, url.toString())
}
