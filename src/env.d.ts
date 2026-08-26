/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_DEFAULT_LOCALE?: "uz" | "ru" | "en";
  readonly PUBLIC_RELEASE_MODE?: "private" | "public";
  readonly PUBLIC_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
