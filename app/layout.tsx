import "../styles/globals.css";

export const metadata = { title: "PlanIt", description: "PlanIt WebApp" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  );
}
