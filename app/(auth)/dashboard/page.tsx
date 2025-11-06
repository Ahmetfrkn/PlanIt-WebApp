type Task = { id: string; title: string; dueDate?: string; status?: string };

const sample: Task[] = [
  { id: "1", title: "Create Tech Stack Notes", status: "todo" },
  { id: "2", title: "Design Architecture Diagram", status: "doing" },
];

export default function Dashboard() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Private area (placeholder). We will protect this with auth later.
      </p>
      <ul className="mt-6 space-y-2">
        {sample.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <div className="font-medium">{t.title}</div>
            <div className="text-sm text-gray-500">{t.status ?? "todo"}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
