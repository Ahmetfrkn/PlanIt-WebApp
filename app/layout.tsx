'use client';

import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="p-4 border-b flex items-center justify-between">
          <a href="/" className="font-semibold">
            PlanIt
          </a>
          <nav className="space-x-4">
            <a href="/dashboard">Dashboard</a>
            <a href="/login">Login</a>
            {/* Logout gerçek auth bağlayınca eklenecek.
                Şimdilik buton yok; bu sayfa sadece navigation. */}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
