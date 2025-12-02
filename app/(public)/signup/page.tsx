'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created. You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-rose-100 to-amber-100 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 bg-white/70 rounded-full px-3 py-1 shadow-sm border border-white/60">
            <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-amber-400 flex items-center justify-center text-white text-xs font-semibold">
              P
            </span>
            <span className="text-xs font-medium text-slate-700">
              PlanIt Sign up
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 leading-tight">
            Create your colorful
            <br />
            planning workspace.
          </h1>
          <p className="text-sm text-slate-600">
            In a few seconds you will have your own space to collect tasks, homework and projects. Simple sign up, no complicated steps.
          </p>
        </div>

        <div className="bg-white/90 border border-white/70 rounded-2xl shadow-md p-6 md:p-7">
          <h2 className="text-xl font-semibold text-slate-900 mb-1 text-center md:text-left">
            Create your PlanIt account
          </h2>
          <p className="text-xs text-slate-500 mb-4 text-center md:text-left">
            Just an email and password, you can change details later.
          </p>

          {message && (
            <p className="mb-3 text-xs text-center text-emerald-600">
              {message}
            </p>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-xs mb-1 text-slate-700">Email</label>
              <input
                type="email"
                required
                className="w-full bg-rose-50 text-slate-900 border border-rose-200 rounded-lg px-3 py-2 text-xs placeholder:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                minLength={6}
                className="w-full bg-rose-50 text-slate-900 border border-rose-200 rounded-lg px-3 py-2 text-xs placeholder:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 text-white text-xs font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-center text-slate-500">
            Already have an account?{' '}
            <a href="/login" className="text-fuchsia-600 font-medium hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
