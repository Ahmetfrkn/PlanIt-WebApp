import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get('title') as string;

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key) => cookieStore.get(key)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect('/login');

  const { error } = await supabase.from('tasks').insert({
    title,
    user_id: user.id,
  });

  if (error) console.error(error);
  return NextResponse.redirect('/dashboard');
}
