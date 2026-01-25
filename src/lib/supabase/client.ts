import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Solo validar en runtime, no en build time
  if (typeof window !== 'undefined') {
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      throw new Error(
        'Supabase no está configurado. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
      );
    }
  }

  // En build time, usar valores por defecto para evitar errores
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder_key';

  return createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Guardar tokens en localStorage para persistencia
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sss-ryder-auth',
    },
  });
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
