// app/api/add-task/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = (formData.get('title') as string)?.trim();

  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Route handlers'ta redirect için mutlak URL ya da new URL kullan
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (title) {
    const { error } = await supabase.from('tasks').insert({
      title,
      user_id: user.id,
    });
    if (error) console.error(error);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
