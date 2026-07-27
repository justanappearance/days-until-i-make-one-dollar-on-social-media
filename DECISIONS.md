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
