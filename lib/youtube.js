export async function fetchYoutubeSubscriberCount() {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.set('part', 'statistics')
  url.searchParams.set('forHandle', process.env.YOUTUBE_CHANNEL_HANDLE)
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY)

  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`YouTube API error: ${resp.status} ${await resp.text()}`)
  }

  const data = await resp.json()
  const channel = data.items?.[0]
  if (!channel) {
    throw new Error('YouTube API returned no channel for YOUTUBE_CHANNEL_HANDLE')
  }

  return Number(channel.statistics.subscriberCount)
}
