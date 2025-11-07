'use client';

import './globals.css';
import React from 'react';
import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-planit text-emerald-50">
        {/* Top navbar */}
        <header className="w-full border-b border-emerald-500/20 bg-black/20 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              <span className="text-emerald-400">Plan</span>It
            </Link>
            <nav className="flex items-center gap-2 text-xs sm:text-sm">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-full hover:bg-emerald-500/10 border border-transparent hover:border-emerald-400/40 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full hover:bg-emerald-500/10 border border-transparent hover:border-emerald-400/40 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold transition"
              >
                Sign up
              </Link>
            </nav>
          </div>
        </header>

        {/* Centered content card */}
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-black/35 border border-emerald-500/15 shadow-[0_18px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
