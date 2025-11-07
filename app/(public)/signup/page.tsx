'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
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
      setMessage('Check your email to confirm your account, then you can log in.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-sm border rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-4 text-center">Create your PlanIt account</h1>
      <form onSubmit={handleSignup} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@student.edu"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full border rounded px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded text-sm"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      {message && (
        <p className="mt-3 text-xs text-center text-slate-600">
          {message}
        </p>
      )}
      <p className="mt-4 text-xs text-center text-slate-500">
        Already have an account?{' '}
        <a href="/login" className="underline">
          Login
        </a>
      </p>
    </div>
  );
}
