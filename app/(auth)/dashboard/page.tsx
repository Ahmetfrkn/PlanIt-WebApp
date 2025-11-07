import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key) => cookieStore.get(key)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login' },
    }) as any;
  }

  const { data: tasks } = await supabase.from('tasks').select('*').order('due_date');

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4 text-gray-600">Welcome, {user.email}</p>
      <ul className="space-y-2">
        {tasks?.map((t) => (
          <li key={t.id} className="border p-3 rounded">
            {t.title}
          </li>
        )) || <p>No tasks yet.</p>}
      </ul>
      <form className="mt-6" action="/api/add-task" method="post">
        <input
          type="text"
          name="title"
          placeholder="New task title"
          className="border p-2 mr-2 rounded"
        />
        <button type="submit" className="border px-4 py-2 rounded">
          Add
        </button>
      </form>
    </main>
  );
}
