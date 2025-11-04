"use client";

// Stubbed client helper. We avoid importing `@supabase/supabase-js` in the
// repository to prevent it from being bundled into server builds where it can
// pull browser-only dependencies. If you need a Supabase client in a
// particular client component, dynamically import `@supabase/supabase-js`
// directly inside that component or use the REST endpoints (PostgREST) via
// fetch as demonstrated elsewhere in the app.

export function getSupabaseClient() {
  throw new Error(
    'getSupabaseClient is not available. Use direct fetch/PostgREST calls or dynamically import @supabase/supabase-js in client components.'
  );
}
