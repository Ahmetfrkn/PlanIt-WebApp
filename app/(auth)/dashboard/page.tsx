import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <section className="mt-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-slate-600 text-sm">
        Logged in as <span className="font-medium">{user.email}</span>
      </p>

      <form
        className="flex gap-2 mt-4"
        action="/api/add-task"
        method="post"
      >
        <input
          type="text"
          name="title"
          required
          placeholder="Add a new task..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-slate-900 text-white text-sm"
        >
          Add
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {!tasks || tasks.length === 0 ? (
          <p className="text-slate-500 text-sm">No tasks yet. Create your first one above.</p>
        ) : (
          tasks.map((t: any) => (
            <div
              key={t.id}
              className="border bg-white rounded-lg px-3 py-2 flex items-center justify-between text-sm"
            >
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-slate-500">
                  {t.status || 'todo'} • {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
