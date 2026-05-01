# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev        # Start Vite dev server (proxies /api → http://localhost:8080)
pnpm run build      # tsc -b && vite build (TypeScript errors block the build)
pnpm run lint       # ESLint
pnpm run test:run   # Vitest test suite
pnpm run test:e2e   # Playwright end-to-end tests
pnpm run check      # lint + test:run + build
pnpm run preview    # Preview production build
```

## Architecture

### Backend proxy

All `/api` requests are proxied to `http://localhost:8080` via Vite dev server config. The axios client (`src/api/client.ts`) has an empty `baseURL`, relying entirely on this proxy. Admin endpoints attach a Bearer token from `sessionStorage`.

### Routing (`src/App.tsx`)

| Path                                                            | Page                   |
| --------------------------------------------------------------- | ---------------------- |
| `/login`                                                        | `Login`                |
| `/`                                                             | `TopicList`            |
| `/topics/:id`                                                   | `TopicDetail`          |
| `/admin/${VITE_ADMIN_SECRET_PATH}`                              | redirects to dashboard |
| `/admin/${VITE_ADMIN_SECRET_PATH}/dashboard`                    | `Dashboard`            |
| `/admin/${VITE_ADMIN_SECRET_PATH}/publishers`                   | `Publisher`            |
| `/admin/${VITE_ADMIN_SECRET_PATH}/publishers/new`               | `PublisherForm`        |
| `/admin/${VITE_ADMIN_SECRET_PATH}/publishers/:publisherId/edit` | `PublisherForm`        |

`VITE_ADMIN_SECRET_PATH` must be set in `.env` to reach admin pages.

### Data layer (`src/api/`)

- `client.ts` — axios instance; reads `admin_token` from `sessionStorage` per request
- `topics.ts` — `getTopics(params)`, `getTopic(id)`; topic detail responses include articles
- `publishers.ts` — full CRUD; includes `normalizePublisher()` which maps legacy `leaning` field → `politicalLeaning`
- `auth.ts` — `login()` returns token metadata; login UI stores token + expiry in `sessionStorage`

All API functions are consumed via TanStack Query (`@tanstack/react-query`). The `QueryClient` is created once in `main.tsx` and provided at the root.

### Types (`src/types/index.ts`)

Key hierarchy: `TopicSummary` (list view) → `TopicDetail extends TopicSummary` (detail, adds title/category/model metadata and `articles`). `TopicArticle` stores article and publisher display fields (`publisherName`, `country`, `politicalLeaning`) rather than embedding a full `Publisher`. `PoliticalLeaning = 'LEFT' | 'CENTER' | 'RIGHT'`; article leaning values are `ArticleLeaning = 'CONSERVATIVE' | 'PROGRESSIVE'`.

### Styling

- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- Custom tokens defined in `src/index.css` `@theme` block: `--color-cc-slate`, `--color-cc-surface-1/2`, `--font-cc-serif`
- Layout constants in `src/components/home/homeLayout.ts`: `homeColumnClass` (max-width column), `homePaddingXClass`
- `cn()` utility in `src/lib/utils.ts` wraps `clsx` + `tailwind-merge`

### Admin authentication

Token stored in `sessionStorage` (not `localStorage`) with an expiry timestamp. Admin access is guarded by `AdminLayout`, which handles the authenticated admin shell. The admin path itself acts as a second factor via `VITE_ADMIN_SECRET_PATH`.

### Tab/filter pattern (TopicListPage)

Tabs are typed as `const TABS = [...] as const; type Tab = (typeof TABS)[number]`. The `useState` initial value must match one of the TABS entries — mismatches cause TypeScript build failures that break the entire app.

## Investigate Before Answering

Never guess about code you have not opened.

If a file is referenced:

- You MUST read that file before answering

Before answering any code-related question:

- inspect relevant files first

Do not assume component structure, API shape, or state logic without reading the code.

If investigation has not been done:

- explicitly say so
- then inspect before answering

Always provide grounded answers based on actual code.

## Working Style

Default to action.
Do not stop at suggestions.

When implementing:

1. Inspect existing components and structure
2. Understand routes, API usage, and state
3. Make a short plan
4. Implement
5. Verify behavior manually
6. Run the relevant tests (`pnpm run test:run` or `pnpm run test:e2e`)
7. Run the full quality gate (`pnpm run check`)
8. Report changes and verification results

Do not ask unnecessary clarifying questions.
Make reasonable assumptions and proceed.

## Verification Rules

Verification is REQUIRED.

Default implementation flow:

1. Implement the requested feature or fix
2. Verify behavior manually in the UI or relevant runtime path
3. Run the relevant test command:
   - `pnpm run test:run` for unit/integration coverage
   - `pnpm run test:e2e` for browser workflow coverage
4. Run `pnpm run check` as the final build/lint/test gate

For every change:

- Verify the component renders correctly
- Verify API data is mapped correctly
- Verify loading / empty / error states
- Verify no obvious layout breakage
- Verify imports and routes are correct

If TypeScript is used:

- ensure type errors do not break the build (`pnpm run build`)

Never claim something works unless it was actually checked.

## UI Guidelines

This is NOT a generic news feed.

This is a news perspective comparison service.

UI must emphasize:

- topic grouping first
- publisher comparison second
- readability of summary
- easy scanning across viewpoints

Do NOT design like a content-heavy news portal.

Keep the UI:

- structured
- minimal
- comparison-focused

If you have not inspected the relevant files yet, you must inspect them before answering.
