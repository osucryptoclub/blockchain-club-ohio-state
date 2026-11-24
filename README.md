# Blockchain Club at Ohio State

The official website of Blockchain Club at Ohio State: who we are, what we work on, and how to join.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Motion, and Lucide.

## Update the site

You don't need to touch the layout to keep the site current. Everything officers change lives in `src/content/`, and each file has a copyable example at the top.

| To change | Edit |
| --- | --- |
| Email, Discord, GroupMe, and social links | `src/content/site.ts` |
| Events | `src/content/events.ts` |
| Projects, research, and hackathon work | `src/content/projects.ts` |
| Leadership and teams | `src/content/team.ts` |
| Sponsors and partnership options | `src/content/sponsors.ts` |
| The areas on What We Do | `src/content/areas.ts` (each has a diagram in `src/components/area-glyph.tsx`) |
| Why people join and how they contribute | `src/content/community.ts` |

Small edits can be made on GitHub with the pencil icon. Open a pull request, wait for the check to pass, and merge.

How the content behaves:

- **Links set to `null`** show as "coming soon" text and cannot be clicked. Add the URL and the link appears everywhere.
- **Events** sort themselves and move to "Past" within about an hour of ending. Dates need a UTC offset: `-05:00` in winter, `-04:00` in summer. A bad date fails the build and names the event.
- **Projects** need at least one public link.
- **Team groups** with no members show a placeholder.
- **Photos and logos** go in `public/team/` and `public/sponsors/`.

Only publish what is confirmed. No unverified events, sponsors, members, or results.

## Run it locally

You need [Node.js](https://nodejs.org/) 22.18 or newer.

```bash
git clone https://github.com/osucryptoclub/blockchain-club-ohio-state.git
cd blockchain-club-ohio-state
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check types |
| `npm test` | Test the hashing, chain, and network code |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run check` | Lint, types, tests, and build. Run this before pushing |

## Deploy

The site deploys to [Vercel](https://vercel.com/) with no extra configuration.

1. In Vercel, choose **Add New > Project** and import `osucryptoclub/blockchain-club-ohio-state`. If the repository isn't listed, an organization owner needs to install or approve the Vercel GitHub app.
2. Keep the detected settings and deploy. No environment variables are required.
3. After that, every push to `main` deploys to production and every pull request gets a preview.

For a custom domain, add it under **Settings > Domains**. If canonical links still show the Vercel address, set `NEXT_PUBLIC_SITE_URL` to the full origin and redeploy. `.env.example` lists every variable.

## Project structure

```
src/
  app/          One folder per page, plus metadata, sitemap, and robots
  components/   Shared interface components
  content/      Everything officers edit
  lib/          Hashing, chain, network, event, and URL logic
tests/          Tests for src/lib
```

Two parts are worth knowing before you change them:

- **The Oval network** (`src/lib/oval.ts`, `src/lib/scene.ts`, `src/components/oval-scene.tsx`) is the club's signature graphic: the crossing paths of the Oval as a lit 3D scene with a block at every crossing. Its shape is inspired by the Oval and is not a map of it. Clicking a block runs a shortest-path broadcast to every other block. It measures the hero copy and places itself clear of it.
- **The chain demo** (`src/lib/chain.ts`, `src/components/chain-demo.tsx`) hashes three blocks with SHA-256 in the browser.

## Brand

| Token | Value | Use |
| --- | --- | --- |
| `black` | `#000000` | Page background |
| `scarlet` | `#BB0000` | Primary buttons, block markers, light, feature sections |
| `scarlet-dark` | `#8B0000` | Glows |
| `white` | `#FFFFFF` | Text, the Projects section |
| `coal`, `panel`, `gray-400` | see `globals.css` | Raised surfaces and secondary text |

Scarlet on black is only strong enough for large shapes. Keep small text white or gray.

Motion lives in `globals.css` and uses CSS scroll-driven animations, so it costs no JavaScript. It is off for visitors who ask for reduced motion, and nothing is hidden when it is off or unsupported.

Type is Archivo, with a wide cut for headings, and IBM Plex Mono for code and hashes. Both are self-hosted at build time.

Always write the name as **Blockchain Club at Ohio State**.

The header and footer use the club's seal (`src/assets/club-logo.jpg`, taken from the club's GitHub organization). It carries the earlier name, The Cryptocurrency Club, along with "The Ohio State University" and a buckeye leaf, so confirm it is cleared before launch. The Oval mark used elsewhere is original artwork. The site uses no Block O, Brutus, or university seal. University names and marks need approval from [Trademark and Licensing Services](https://trademarklicensing.osu.edu/page/student-request), and registered student organizations must carry the university's disclaimer. The `registration` setting in `src/content/site.ts` controls which disclaimer the footer shows. Leave it as `"unconfirmed"` until the club's registration under this name is active.

## Contribute

1. Create a branch from `main`.
2. Make the change and run `npm run check`.
3. Open a pull request that says what changed and why.

Never commit keys, tokens, or `.env` files.
