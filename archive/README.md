# Archive

We keep old and unused files here instead of deleting them. Nothing in this
folder is part of the website: it isn't built, checked or linted, and none of
these pages can be opened on the site.

| What | Was at | Why it's here |
|------|--------|---------------|
| `pages/standardize`, `pages/report/data` | `/standardize`, `/report/data` | Data standardization tool (two identical copies). Not linked from the site yet. |
| `pages/metrics` | `/metrics` | Metrics entry page. Not linked from the site. |
| `pages/report/background` | `/report/background` | Background questions. Not linked from the site. |
| `pages/upload` | `/upload` | Early upload page, replaced by Submit Evidence. |
| `pages/login`, `pages/signup`, `pages/report/assessment` | — | Backup copies of pages that are live. |
| `components/home-old`, `components/roadmap` | `src/_components` | Earlier versions of the home page and roadmap cards. |
| `components/DashboardView.tsx`, `lib/invites.ts` | `src/_components`, `src/lib` | An early dashboard and invite helper. Nothing used them. |
| `scripts` | repo root | Python test scripts for Supabase and the Duke AI service. |

To bring a page back, move its folder back under `src/app` (for example
`archive/pages/metrics` → `src/app/metrics`). The helpers these pages use are
still in `src/lib` (`standardization/`, `background-q.ts`), so imports work
again as soon as the page is moved back.
