'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // Başarılı: direkt dashboard'a gönder
    setMessage('Logged in, redirecting...');
    window.location.href = '/dashboard';
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-2 text-center text-emerald-300">
          Login to PlanIt
        </h1>
        <p className="text-xs text-slate-400 text-center mb-4">
          Use the email &amp; password you registered with.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-emerald-200">Email</label>
            <input
              type="email"
              required
              className="w-full bg-emerald-50 text-slate-900 border border-emerald-400/70 rounded-lg px-3 py-2 text-xs placeholder:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@student.edu"
            />
          </div>
          <div>
            <label className="block text-xs mb-1 text-emerald-200">Password</label>
            <input
              type="password"
              required
              className="w-full bg-emerald-50 text-slate-900 border border-emerald-400/70 rounded-lg px-3 py-2 text-xs placeholder:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-xs font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-[10px] text-center text-emerald-300">
            {message}
          </p>
        )}

        <p className="mt-4 text-[10px] text-center text-slate-300">
          No account?{' '}
          <a href="/signup" className="text-emerald-300 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
