// app/(auth)/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function Dashboard() {
  // Supabase server-side client (Next.js App Router için önerilen yöntem)
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login'); // server component'ta Response dönmeye çalışma; redirect helper kullan
  }

  // tasks tablosundan verileri çek
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    // production'da sessiz kalmak daha iyi ama basitçe fallback verelim
    console.error(error);
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4 text-gray-600">Welcome{user?.email ? `, ${user.email}` : ''}</p>

      {!tasks || tasks.length === 0 ? (
        <p className="text-gray-600">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t: any) => (
            <li key={t.id} className="border p-3 rounded">
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-gray-500">{t.status ?? 'todo'}</div>
            </li>
          ))}
        </ul>
      )}

      <form className="mt-6" action="/api/add-task" method="post">
        <input
          type="text"
          name="title"
          placeholder="New task title"
          className="border p-2 mr-2 rounded"
          required
        />
        <button type="submit" className="border px-4 py-2 rounded">
          Add
        </button>
      </form>
    </main>
  );
}
