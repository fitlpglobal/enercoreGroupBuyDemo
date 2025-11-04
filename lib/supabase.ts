// This file previously provided a Supabase client helper. To avoid pulling
// `@supabase/supabase-js` (and its realtime/browser-only deps) into server
// bundles during the Next.js build, the app now uses direct REST (PostgREST)
// fetch calls from client components. Types are moved to `lib/types.ts`.

// Keep this file as a placeholder to avoid accidental imports. Do not import
// from here in client code; import types from `lib/types` instead.

export const __deprecated = true;
