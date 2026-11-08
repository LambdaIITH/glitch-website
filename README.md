# Glitch website

The site of Glitch, the video game club of IIT Hyderabad. A static [Astro](https://astro.build) site: no server, no
database, and pages ship no JavaScript unless they need it.

## Run it

Needs Node 22.23 or newer.

```sh
npm install
npm run dev       # live-reloading site at http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/ at http://localhost:4321 (Ctrl+C to stop)
npm test          # date helper tests
```

## Adding events and games (for club heads, no code)

The site uses [Pages CMS](https://pagescms.org), the same editor as the Elektronica site.

1. A maintainer invites you in Pages CMS as a collaborator, by your IITH email. You don't need a GitHub account.
2. Go to https://app.pagescms.org, sign in with that email and the one-time code it sends you, and open the site.
3. Choose **Events**, **Games** or **Club details**, add or edit an entry, and save.

Saving commits the change, and the site and its `/api` feeds rebuild in about a minute. Tick **Draft** to keep an
entry hidden until it's final. Uploaded images go to `src/assets/uploads/` and are turned into small WebP files
automatically. Use only images the club made or has the right to use, and never paste Google Forms, Drive or
WhatsApp links or phone numbers.

One-time setup for maintainers:

- Install the Pages CMS GitHub App on this repository only ("Only select repositories"), and read the permissions
  GitHub shows before approving.
- Invite heads as collaborators by email. Don't give heads write access on GitHub: that is code access, not content.
- Protect `main` with a ruleset that blocks force pushes and deletion, so any bad commit can be reverted.
- Each year at handover: remove last year's collaborators, export the org audit log, and check that at least two
  people own the GitHub org.

The form fields are defined in `.pages.yml`. Everything typed there is checked again at build time by
`src/lib/schema.ts`: links must start with `https://` (or `/` for a page on this site), and text can't contain
markup. A failing check fails the build, so nothing unsafe goes live.

## Editing content

Everything lives in `src/data/`:

| File | What it holds |
| --- | --- |
| `events.json` | Every event: dates (`YYYY-MM-DD`), kind (`game-dev`, `esports` or `community`), venue, summary, public links. The Events page, Home and `/api/events.json` all read it. |
| `games.json` | The games list. Images go in `src/assets/` and are named by their path there. |
| `cogito.json` | Cogito's frozen final standings. |
| `club.json` | Contact links and the current leads. |

Home's "next event" is worked out when the site is built, so the site rebuilds every night (`.github/workflows/deploy.yml`).

## Feeds for the SciTech site

`/api/events.json` and `/api/projects.json` are rebuilt from the same data as the pages, so anything added in Pages
CMS shows up in them too. Drafts, and events without an exact date, are left out. Any site can fetch them from the
browser (the server sends `Access-Control-Allow-Origin: *` for `/api/`), but fetching at build time is more robust.

They follow the shared SciTech shape (Elektronica's is the reference): `{ "club", "version": 1, "events" | "projects": [...] }`.

| Feed | Shared fields | Glitch's optional extras |
| --- | --- | --- |
| events | `title`, `date` (start, `YYYY-MM-DD`), `type`, `venue`, `summary`, `link` | `id` (stable), `end` (`YYYY-MM-DD`, equals `date` for one-day events), `kind` (`game-dev`, `esports`, `community`), `image` (absolute URL, only when there is one) |
| projects | `title`, `summary`, `status`, `tags`, `link` | `id` (stable), `image` (absolute URL) |

Readers of the shared shape can ignore the extras; the version stays 1 because nothing was removed or renamed.

## Deploying

The site is hosted with the other SciTech club sites on Lambda's server. How that works, and the server's setup,
are in [LambdaIITH/scitech-hosting](https://github.com/LambdaIITH/scitech-hosting).

GitHub Actions builds the site on every push to `main` (including every Pages CMS save) and every night, runs the
tests and the content check, and publishes the built files to the `deploy` branch (`.github/workflows/deploy.yml`,
which calls the shared SciTech build). The server picks up a new build within 5 minutes. A build that fails the
content check never reaches `deploy`, so the live site stays on the last good version. The nightly run keeps
Home's "next event" line current; GitHub pauses it after 60 days without commits, and the Actions tab turns it
back on.

### Elsewhere

Cloudflare Pages and Netlify both work too: they read `public/_headers` and `public/_redirects`. On their free plans
the build count is the limit (Cloudflare Pages: 500 a month; Netlify: 300 credits at 15 per production deploy).
On any other static host, upload `dist/`; `/leaderboard` still redirects through an HTML page.

The design system (colours, type, spacing, components, motion rules) is at `/styleguide/`.

## Look and motion

"Glitch arcade" on the Ember palette: a warm charcoal with the logo's red, orange and amber. Effects live in
`src/scripts/effects.ts` and `src/components/FeatureBanner.astro`: the first-visit sprite loader, pixel-dissolve
reveals, RGB-split glitches, tilting game tiles, scanlines over footage, a pixel cursor and optional sound. Every
effect is off with reduced motion, and every page is complete without JavaScript.

## Visuals

All game visuals are the club's own: gameplay recorded from the Cogito and 2025 Milan builds (`public/footage/`),
screenshots and covers from the club's itch.io pages, and loader sprites cut from those (`src/assets/sprites/`).
Jam entries belong to their makers: ask them before showing their art.

## Fonts

Self-hosted from `src/fonts/`, all under the SIL Open Font License:

- [Work Sans](https://fonts.google.com/specimen/Work+Sans) SemiBold: the typeface of the logo's "Glitch", for every heading, in Title Case.
  Glitches flash the logo's pink and cyan split for under half a second (SVG filters in `src/layouts/Base.astro`).
- [Big Shoulders Display](https://fonts.google.com/specimen/Big+Shoulders+Display) Black: small labels, in Title Case. Running text is in
  sentence case.
- [Departure Mono](https://departuremono.com) by Helena Zhang: numbers, dates and scores. Drawn on an
  11px grid, so only use it at 11, 22, 33, 44 or 66px.
- [Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/) by the Braille Institute: body text.

Brand icons for Discord, itch.io, Instagram and GitHub are from [Simple Icons](https://simpleicons.org) (CC0).
