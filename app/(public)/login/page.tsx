export default function Login() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-2 text-gray-600">
        This is the login page. We will connect real authentication later.
      </p>
      <a
        className="inline-block mt-6 px-4 py-2 border rounded"
        href="/dashboard"
      >
        Go to Dashboard (placeholder)
      </a>
    </main>
  );
}
