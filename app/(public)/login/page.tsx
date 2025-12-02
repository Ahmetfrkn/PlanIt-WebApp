'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-cyan-100 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 bg-white/70 rounded-full px-3 py-1 shadow-sm border border-white/60">
            <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
              P
            </span>
            <span className="text-xs font-medium text-slate-700">
              PlanIt Login
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 leading-tight">
            Welcome back,
            <br />
            pick up where you left off.
          </h1>
          <p className="text-sm text-slate-600">
            Log in to see your tasks, deadlines and projects. Designed for students and busy people who want a clear and colorful overview of their day.
          </p>
        </div>

        <div className="bg-white/90 border border-white/70 rounded-2xl shadow-md p-6 md:p-7">
          <h2 className="text-xl font-semibold text-slate-900 mb-1 text-center md:text-left">
            Log in to PlanIt
          </h2>
          <p className="text-xs text-slate-500 mb-4 text-center md:text-left">
            Use the email and password you registered with.
          </p>

          {message && (
            <p className="mb-3 text-xs text-center text-rose-500">
              {message}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs mb-1 text-slate-700">Email</label>
              <input
                type="email"
                required
                className="w-full bg-sky-50 text-slate-900 border border-sky-200 rounded-lg px-3 py-2 text-xs placeholder:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@student.edu"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-700">Password</label>
              <input
                type="password"
                required
                className="w-full bg-sky-50 text-slate-900 border border-sky-200 rounded-lg px-3 py-2 text-xs placeholder:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-center text-slate-500">
            Need an account?{' '}
            <a href="/signup" className="text-sky-600 font-medium hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
