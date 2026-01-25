import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cookie expiration: 30 days
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: COOKIE_MAX_AGE,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
