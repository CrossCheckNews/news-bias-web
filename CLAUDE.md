# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (proxies /api → http://localhost:8080)
npm run build      # tsc -b && vite build (TypeScript errors block the build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test runner is configured.

## Architecture

### Backend proxy

All `/api` requests are proxied to `http://localhost:8080` via Vite dev server config. The axios client (`src/api/client.ts`) has an empty `baseURL`, relying entirely on this proxy. Admin endpoints attach a Bearer token from `sessionStorage`.

### Routing (`src/App.tsx`)

| Path                                                            | Page                     |
| --------------------------------------------------------------- | ------------------------ |
| `/`                                                             | `TopicListPage`          |
| `/topics/:id`                                                   | `TopicDetailPage`        |
| `/admin/${VITE_ADMIN_SECRET_PATH}`                              | `AdminPage`              |
| `/admin/${VITE_ADMIN_SECRET_PATH}/publishers/new`               | `AdminPublisherFormPage` |
| `/admin/${VITE_ADMIN_SECRET_PATH}/publishers/:publisherId/edit` | `AdminPublisherFormPage` |

`VITE_ADMIN_SECRET_PATH` must be set in `.env` to reach admin pages.

### Data layer (`src/api/`)

- `client.ts` — axios instance; reads `admin_token` from `sessionStorage` per request
- `topics.ts` — `getTopics(params)`, `getTopic(id)`, `getTopicArticles(id)`
- `publishers.ts` — full CRUD; includes `normalizePublisher()` which maps legacy `leaning` field → `politicalLeaning`
- `auth.ts` — `login()` → stores token + expiry in `sessionStorage`

All API functions are consumed via TanStack Query (`@tanstack/react-query`). The `QueryClient` is created once in `main.tsx` and provided at the root.

### Types (`src/types/index.ts`)

Key hierarchy: `TopicSummary` (list view) → `Topic extends TopicSummary` (detail, adds `leaningDistribution` and `countryDistribution`). `TopicArticle` embeds a full `Publisher`. `PoliticalLeaning = 'LEFT' | 'CENTER' | 'RIGHT'`.

### Styling

- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- Custom tokens defined in `src/index.css` `@theme` block: `--color-cc-slate`, `--color-cc-surface-1/2`, `--font-cc-serif`
- Layout constants in `src/components/home/homeLayout.ts`: `homeColumnClass` (max-width column), `homePaddingXClass`
- `cn()` utility in `src/lib/utils.ts` wraps `clsx` + `tailwind-merge`

### Admin authentication

Token stored in `sessionStorage` (not `localStorage`) with an expiry timestamp. `getToken()` in `AdminPage.tsx` auto-clears expired tokens. The admin path itself acts as a second factor via `VITE_ADMIN_SECRET_PATH`.

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
5. Verify UI behavior
6. Report changes

Do not ask unnecessary clarifying questions.
Make reasonable assumptions and proceed.

## Verification Rules

Verification is REQUIRED.

For every change:

- Verify the component renders correctly
- Verify API data is mapped correctly
- Verify loading / empty / error states
- Verify no obvious layout breakage
- Verify imports and routes are correct

If TypeScript is used:

- ensure type errors do not break the build (`npm run build`)

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
