export default function Home() {
  return (
    <section className="mt-8 space-y-4">
      <h1 className="text-3xl font-bold">PlanIt – Simple student project planner</h1>
      <p className="text-slate-600 max-w-2xl">
        PlanIt helps students organize tasks, milestones, and deadlines for group projects.
        Each user sees their own tasks, stored securely in a PostgreSQL database via Supabase.
      </p>
      <div className="space-x-3 mt-4">
        <a
          href="/signup"
          className="inline-block px-4 py-2 rounded bg-slate-900 text-white text-sm"
        >
          Get started
        </a>
        <a
          href="/login"
          className="inline-block px-4 py-2 rounded border text-sm"
        >
          I already have an account
        </a>
      </div>
    </section>
  );
}
