import "../styles/globals.css";

export const metadata = { title: "PlanIt", description: "PlanIt WebApp" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="p-4 border-b flex items-center justify-between">
          <a href="/" className="font-semibold">PlanIt</a>
          <nav className="space-x-4">
            <a href="/dashboard">Dashboard</a>
            <a href="/login">Login</a>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-3 py-1 border rounded"
            >
              Logout
            </button>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

