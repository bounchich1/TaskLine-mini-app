# MAX support mini-app

The staff application (Russian UI) that runs inside MAX. It talks only to the server's `/v1` API
and holds no provider credentials. See [ARCHITECTURE.md](ARCHITECTURE.md) for the code layout
and its rules.

## Local development

```sh
npm install
npm run dev               # against the server on 127.0.0.1:3000 (proxied /v1)
npm run demo              # sign in through /v1/auth/dev (server with DEV_AUTH_ENABLED=true)
```

`.env.example` lists the public settings; never put secrets in `VITE_*` variables.

## Checks

```sh
npx playwright install chromium   # once, for the tests
npm run check             # format, lint, styles, typecheck, knip, tests, build
```

## Deployment

`Dockerfile` builds the app and serves it with Caddy on port 8080 (`deploy/Caddyfile`:
`index.html` is never cached, hashed assets are cached for a year). Pushing a `v*` tag builds
`ghcr.io/<owner>/max-support-mini-app:<tag>` with that tag as the app version (shown in
Управление → Состояние системы) and, when configured, deploys it. The production stack and
its runbook live in the server repository: `deploy/` and `runbooks/deploy.md`.
