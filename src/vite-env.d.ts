/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the API server; empty means the same origin (the dev server proxies /v1). */
  readonly VITE_API_BASE?: string;
  /** `true` signs in through /v1/auth/dev instead of MAX launch data (dev server only). */
  readonly VITE_DEV_AUTH?: string;
  /** MAX user id used by the dev sign-in. */
  readonly VITE_DEV_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
