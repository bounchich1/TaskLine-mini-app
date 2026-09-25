# Mini-app architecture

A React app for support staff inside MAX. Code is split into feature slices with explicit,
lint-enforced dependencies; styles are SCSS with BEM class names and shared design tokens.

## Layout

```
src/
  app/              Composition: entry point, providers, the auth gate and the workspace shell
    workspace/      Workspace layout, header, live updates (SSE → query invalidation)
  features/<name>/  Feature slices. Public API = index.ts, nothing else.
    auth/           sign-in (deduplicated), session state, launch screen
    ticket-queue/   filters, the paged list, the queue table
    ticket-detail/  the ticket card: conversation, composer, uploads, commands, dialogs
    notifications/  the notification list
    admin/          employees, dictionaries, templates, settings, diagnostics, audit
  shared/           Used everywhere; imports only shared/.
    api/            http (api, ApiError, session headers), event stream, downloads, query keys
    config/         typed env, labels for API codes
    lib/            date helpers
    platform/       the MAX WebApp bridge
    types/          API types
    ui/             generic components (Modal, Select, FormField, …)
    styles/         abstracts (tokens, mixins, breakpoints — no CSS output) and base styles
```

Inside a feature: `components/<Name>/<Name>.tsx` (+ `<Name>.scss`), `hooks/`, `model/`, `api/`.

## Dependencies

| From       | May import                                        |
| ---------- | ------------------------------------------------- |
| `shared`   | `shared`                                          |
| `features` | `shared`, other features through their `index.ts` |
| `app`      | `shared`, features through their `index.ts`       |

Enforced by `eslint-plugin-boundaries` in `eslint.config.js`: a file outside this layout, a deep
import into another feature, or `shared` importing a feature fails the lint.

State that must survive switching sections (queue filters, the ticket list feeding the sidebar
count, notifications, unsent drafts) is owned by `app/`, not by the section's page.

Live updates (`app/workspace/use-live-updates.ts`): the event stream starts from the server's
newest event, not from its history. Events arriving within 300 ms are batched into one round of
refetches, and each event invalidates only what it affects: a ticket event the queue, the
notifications and that ticket's card; `admin.changed` the dictionaries and employees. Every
(re)connect refetches everything, since events may have been missed while offline.

## Styles

- Every component imports its own stylesheet last: `import './Name.scss';`. Each stylesheet
  starts with `@use 'abstracts' as *;` (resolved through Vite's Sass `loadPaths`).
- Class names are BEM: `block`, `block__element`, `block--modifier`; toggle modifiers with
  `clsx`. Media queries sit inside the rule they change: `@include respond-to(phone)`
  (breakpoints: `tablet` ≤ 1099, `phone` ≤ 639; mirrored in `shared/lib/use-media-query.ts`).
  The ticket card adapts to its own width instead: `@include container-below(ticket, 760px)`.
- Colors, font sizes (`@include text(step)`, which also sets the line height), font families,
  weights and z-indexes come from `shared/styles/abstracts`; stylelint rejects raw values, hex
  colors and `!important`.
- Colors are CSS custom properties, so light and dark switch at run time with the device's
  color scheme (`app/providers.tsx`). Surfaces, text, dividers and the accent are MAX UI's own
  theme variables; the app's extra tokens (urgency, status, bubbles, notices) are defined per
  scheme in `abstracts/_palette.scss` and published as `--app-*` by `base/_theme.scss`.
- The font is the platform's system font (SF, Roboto, Segoe UI), as in MAX itself. MAX UI takes
  the font of its whole tree from `--family-base` on its root element, which carries our
  `app-root` class; `base/_theme.scss` sets it.
- `base/_max-ui-overrides.scss` is the only place for `!important` and selectors into MAX UI's
  generated markup.
- Focus: text fields and selects show it with `field-focus` (an accent edge and a soft halo),
  full-width rows with `focus-ring-inset` (a scrolling list clips an outer ring), everything else
  with the global outline. Selects are `shared/ui/Select`, never a native `<select>`, whose menu
  is drawn by the OS.

## Layout

- Wide screens (≥ 1100 px): header with the navigation on top; the queue is a full table, and
  opening a ticket splits the screen into the queue as a list and the ticket beside it.
- Narrower screens: one pane at a time; an open ticket replaces the queue and goes back with an
  arrow (or MAX's Back button). On phones the navigation is a bottom tab bar, hidden while a
  ticket is open.

## What goes where

- **A new screen or workflow**: a feature slice; export only what `app/` or other features use.
- **Code two features need**: `shared/` if it has no feature logic, otherwise export it from
  the owning feature's `index.ts`.
- **A new API call**: in the feature's `api/` or hook, through `shared/api/http.ts`; query keys
  go in `shared/api/query-keys.ts`.
- **A label for an API code**: `shared/config/labels.ts`.

## Conventions

- Components are `PascalCase.tsx` in a folder of the same name; every other file is kebab-case.
- One component per file; no default exports; `@/` instead of `../../`.
- Files ≤ 250 lines, functions ≤ 60 lines (120 in `.tsx`), complexity ≤ 12, ≤ 4 parameters.

## Guardrails

`npm run check` runs Prettier, ESLint, stylelint, `tsc`, knip, the Playwright tests and the
build; CI runs the same. The Playwright suite mocks every `/v1` call; the screenshot tests run
locally only (baselines are per OS). Locally, `PLAYWRIGHT_CHANNEL=msedge` (or `chrome`) uses an
installed browser instead of the bundled Chromium.
