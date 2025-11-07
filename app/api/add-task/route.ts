import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = (formData.get('title') as string)?.trim();

  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!title) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  await supabase.from('tasks').insert({
    title,
    user_id: user.id,
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
