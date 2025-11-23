/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER1_USERNAME?: string;
  readonly VITE_USER1_PASSWORD?: string;
  readonly VITE_USER1_NAME?: string;
  readonly VITE_USER2_USERNAME?: string;
  readonly VITE_USER2_PASSWORD?: string;
  readonly VITE_USER2_NAME?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

