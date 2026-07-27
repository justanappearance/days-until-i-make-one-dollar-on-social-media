import { fetchYoutubeSubscriberCount } from '../lib/youtube.js'
import { fetchInstagramFollowerCount } from '../lib/instagram.js'
import { upsertStat } from '../lib/upsertStat.js'

const COLLECTORS = {
  youtube: fetchYoutubeSubscriberCount,
  instagram: fetchInstagramFollowerCount,
  // tiktok: fetchTiktokFollowerCount, // added once the TikTok app is set up
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const results = {}

  for (const [platform, fetchCount] of Object.entries(COLLECTORS)) {
    try {
      const count = await fetchCount()
      await upsertStat(platform, count)
      results[platform] = { ok: true, count }
    } catch (e) {
      results[platform] = { ok: false, error: e.message }
    }
  }

  res.status(200).json(results)
}
