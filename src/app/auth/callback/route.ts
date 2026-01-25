import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Always redirect to dashboard - let the dashboard handle onboarding check
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
