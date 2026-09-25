/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE?: string;
    readonly VITE_DEV_AUTH?: string;
    readonly VITE_DEV_USER_ID?: string;
    readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
