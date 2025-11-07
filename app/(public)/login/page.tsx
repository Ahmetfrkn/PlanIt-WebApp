// app/(public)/login/page.tsx
'use client';
import { supabase } from '../../../lib/supabaseClient';

export default function Login() {
  async function signIn() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert(error.message);
  }
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-6">Login to PlanIt</h1>
      <button className="px-4 py-2 border rounded hover:bg-gray-100" onClick={signIn}>
        Sign in with Google
      </button>
    </main>
  );
}
