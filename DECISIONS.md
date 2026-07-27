# Decisions

## Mirror the same stack (Vercel + Supabase REST, no framework)
- Decision: Same shape as stop-gooning / quitting-the-internet — static HTML/CSS/JS frontend, Vercel serverless functions in `api/`, Supabase accessed directly via its REST API.
- Why: Same low-traffic single-table personal-tracker problem; the stack is already proven across two other sites.
- Rejected: A framework, a different backend.
- Why rejected: No benefit at this scale.
- Date: 2026-07-27

## Reuse the existing shared Supabase project, new table `dollar_milestones`
- Decision: New table on the same Supabase project the other two trackers use, reusing the same `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` env var values.
- Why: Consistent with how quitting-the-internet was added — no new account needed for another tiny table.
- Date: 2026-07-27

## No daily logging — this tracker only counts elapsed days
- Decision: Unlike the other two trackers, there's no per-day clean/relapsed/etc. status to log. The big number on the page is just `(today - START_DATE) + 1`, computed client-side. The `/admin` page and `dollar_milestones` table exist only to mark the date(s) the user actually made $1, shown as a highlighted day on the calendar — they don't feed into the counter at all.
- Why: User was explicit there's no way to "mess up a day" here — it's a pure elapsed-day count until the goal happens.
- Date: 2026-07-27

## Counter does not freeze when the goal is hit
- Decision: Even after logging a "made $1" milestone, `day-count` keeps ticking up forever — it is never based on whether a milestone exists.
- Why: User explicitly said not to freeze it; said he'd come back to discuss what the app should do once he's actually made $1 rather than deciding that now.
- Date: 2026-07-27

## Start date: July 27, 2026 (assumed = day the goal was set)
- Decision: `START_DATE` in `app.js` is 2026-07-27.
- Why: No explicit date was given; this is the day the user said "it's time to set a new goal." Flagged as an assumption — correct in `app.js` if wrong.
- Date: 2026-07-27

## Kept standalone, no shared hub page across the 3 trackers
- Decision: This tracker is a separate site/repo, same as the other two — no shared landing page linking all three (yet).
- Why: User's own call when asked; can revisit later without much rework if he changes his mind.
- Date: 2026-07-27

## Growth chart reads directly from the shared `platform_stats` table (owned by social-stats)
- Decision: Added a 3-line Chart.js graph (YouTube/Instagram/TikTok) under the day counter. `api/stats.js` here is a read-only copy of `social-stats`' endpoint, querying the same `platform_stats` table in the shared Supabase project, filtered client-side to dates on/after this tracker's `START_DATE`. This project never writes to that table — the `social-stats` project's daily cron is the only writer.
- Why: Both projects already share one Supabase project/credentials; duplicating a tiny read-only GET endpoint is simpler than extracting a shared package for two files. Filtering to `START_DATE` makes sense here because that's also the day social-stats' data collection was set up, so it doubles as "growth since I set this goal."
- Date: 2026-07-27
- Superseded: see next entry — folded into this project entirely a few hours later, same day.

## Merged `social-stats` into this project; retired the standalone repo
- Decision: Moved `lib/youtube.js`, `lib/upsertStat.js`, and `api/collect.js` from the separate `social-stats` repo into this project, added its daily cron (`/api/collect`, `0 13 * * *`) to this project's `vercel.json`, and deleted the `social-stats` GitHub repo.
- Why: The follower-growth graph only ever existed to sit under this tracker's day counter — there was no independent use case for `social-stats` as its own product, and Mike explicitly said no shared hub across trackers, which was the one scenario where a separate reusable stats service would've paid off. Splitting it out first was premature; nothing had been deployed to `social-stats` on Vercel yet and no data had been collected, so this was a same-day, zero-cost consolidation rather than a real migration.
- Rejected: Keeping `social-stats` as its own deployed service that this project reads from.
- Why rejected: Two Vercel projects to keep env vars in sync on, and a duplicated `api/stats.js`, for what is really one page.
- Date: 2026-07-27

## Instagram: "Instagram API with Instagram Login" (graph.instagram.com), not Facebook Login for Business
- Decision: `lib/instagram.js` / `lib/instagramToken.js` / `api/instagram-authorize.js` / `api/instagram-callback.js` use the direct Instagram Login OAuth flow — `instagram.com/oauth/authorize` → `api.instagram.com/oauth/access_token` (short-lived) → `graph.instagram.com/access_token` (long-lived, ~60 days) → `graph.instagram.com/me?fields=followers_count`. Refresh happens automatically inside `fetchInstagramFollowerCount()` whenever the stored token is within 3 days of expiring, via `graph.instagram.com/refresh_access_token`.
- Why: Confirmed from Mike's actual Meta app dashboard (use case "Manage messaging & content on Instagram," permissions `instagram_business_basic` etc., and the "Set up Instagram business login" step asking only for a redirect URL) — this is the newer product that doesn't require linking a Facebook Page, unlike the older Instagram Graph API via Facebook Login for Business. Confirmed by screenshot rather than assumed, per the earlier decision not to write OAuth code blind.
- Rejected: Facebook Login for Business flow (graph.facebook.com, requires a linked Facebook Page).
- Why rejected: Not what Mike's app was actually configured for — would have meant redoing the app setup.
- No refresh_token concept here: Instagram's long-lived access token refreshes itself in place (there's no separate refresh_token), so `platform_tokens.refresh_token` stays unused for the `instagram` row.
- Date: 2026-07-27
