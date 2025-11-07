'use client';

import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="w-full border-b bg-white">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold text-lg">
              PlanIt
            </a>
            <nav className="space-x-4 text-sm">
              <a href="/dashboard" className="hover:underline">
                Dashboard
              </a>
              <a href="/login" className="hover:underline">
                Login
              </a>
              <a href="/signup" className="hover:underline">
                Sign up
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
