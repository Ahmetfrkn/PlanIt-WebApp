'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

type Course = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  semester: string | null;
  color: string | null;
};

type Task = {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
  task_date?: string | null;
  course_id?: string | null;
  type?: string | null;
  due_date?: string | null;
  priority?: number | null;
};

type Section = 'overview' | 'tasks' | 'courses' | 'calendar' | 'projects';

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [filterCourseId, setFilterCourseId] = useState<string | 'all'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string | 'all'>(
    'all'
  );
  const [selectedType, setSelectedType] = useState<string>('assignment');
  const [selectedPriority, setSelectedPriority] = useState<string>('2');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseSemester, setNewCourseSemester] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push('/login');
        return;
      }

      setUserId(data.user.id);
      setUserEmail(data.user.email ?? null);

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });

      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', data.user.id)
        .order('name', { ascending: true });

      setTasks((tasksData as Task[]) || []);
      setCourses((coursesData as Course[]) || []);
      setLoading(false);
    }

    load();
  }, [router]);

  const coursesById: Record<string, Course> = {};
  courses.forEach((c) => {
    coursesById[c.id] = c;
  });

  const tasksForSelectedDate = tasks.filter((t) => {
    const baseDate = (t.task_date || t.due_date || t.created_at || '').slice(
      0,
      10
    );
    if (baseDate !== selectedDate) return false;
    if (filterCourseId !== 'all' && t.course_id !== filterCourseId) return false;
    return true;
  });

  const totalForDay = tasksForSelectedDate.length;
  const completedForDay = tasksForSelectedDate.filter(
    (t) => t.status === 'done'
  ).length;
  const progress =
    totalForDay === 0 ? 0 : Math.round((completedForDay * 100) / totalForDay);

  async function handleAddTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId || !newTitle.trim()) return;

    setSavingTask(true);
    setError(null);

    const payload: any = {
      title: newTitle.trim(),
      user_id: userId,
      status: 'todo',
      task_date: selectedDate,
      type: selectedType,
      priority: Number(selectedPriority),
    };

    if (selectedCourseId !== 'all') {
      payload.course_id = selectedCourseId;
    }

    if (selectedDueDate) {
      payload.due_date = selectedDueDate;
    } else {
      payload.due_date = selectedDate;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTasks((prev) => [data as Task, ...prev]);
      setNewTitle('');
    }

    setSavingTask(false);
  }

  async function handleAddCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId || !newCourseName.trim()) return;

    setSavingCourse(true);

    const palette = ['emerald', 'sky', 'cyan', 'amber', 'violet', 'rose'];
    const chosen = palette[courses.length % palette.length] || 'emerald';

    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          user_id: userId,
          name: newCourseName.trim(),
          code: newCourseCode.trim() || null,
          semester: newCourseSemester.trim() || null,
          color: chosen,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setCourses((prev) => [...prev, data as Course]);
      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseSemester('');
    }

    setSavingCourse(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function toggleTaskStatus(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done';

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    }
  }

  async function deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  }

  async function editTask(task: Task) {
    const updated = window.prompt('Update task title', task.title);
    if (!updated || !updated.trim()) return;

    const trimmed = updated.trim();
    const { error } = await supabase
      .from('tasks')
      .update({ title: trimmed })
      .eq('id', task.id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, title: trimmed } : t))
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fb] via-[#f2fbf7] to-[#eef4ff]">
        <div className="px-4 py-3 rounded-2xl bg-white/80 shadow-xl border border-white text-slate-500 text-sm">
          Loading your student dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fb] via-[#f1fbf7] to-[#eef4ff] text-slate-900 flex justify-center px-3 py-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white/80 backdrop-blur-2xl shadow-[0_24px_70px_rgba(15,23,42,0.18)] border border-white/70 flex overflow-hidden">
        <Sidebar
          active={activeSection}
          onChange={(s) => setActiveSection(s)}
          email={userEmail}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        <div className="flex-1 flex flex-col border-l border-slate-100/60">
          <Header activeSection={activeSection} email={userEmail} />

          <main className="flex-1 px-5 md:px-7 py-5 space-y-5 overflow-y-auto">
            {activeSection === 'overview' && (
              <>
                <section className="grid grid-cols-1 lg:grid-cols-[1.7fr,1.1fr] gap-4">
                  <OverviewFocusCard
                    courses={courses}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    filterCourseId={filterCourseId}
                    setFilterCourseId={setFilterCourseId}
                    selectedCourseId={selectedCourseId}
                    setSelectedCourseId={setSelectedCourseId}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedPriority={selectedPriority}
                    setSelectedPriority={setSelectedPriority}
                    selectedDueDate={selectedDueDate}
                    setSelectedDueDate={setSelectedDueDate}
                    newTitle={newTitle}
                    setNewTitle={setNewTitle}
                    onSubmit={handleAddTask}
                    savingTask={savingTask}
                    error={error}
                  />

                  <ProgressCard
                    totalForDay={totalForDay}
                    completedForDay={completedForDay}
                    progress={progress}
                  />
                </section>

                <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                  <SectionHeader
                    title="Tasks for this day"
                    subtitle="Review and manage the tasks scheduled for the selected date."
                  />
                  <TaskList
                    tasks={tasksForSelectedDate}
                    coursesById={coursesById}
                    toggleTaskStatus={toggleTaskStatus}
                    editTask={editTask}
                    deleteTask={deleteTask}
                  />
                </section>
              </>
            )}

            {activeSection === 'tasks' && (
              <>
                <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                  <SectionHeader
                    title="All tasks"
                    subtitle="Add assignments, readings, quizzes and more. Filter them by date and course."
                  />
                  <TasksFormBar
                    courses={courses}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    filterCourseId={filterCourseId}
                    setFilterCourseId={setFilterCourseId}
                    selectedCourseId={selectedCourseId}
                    setSelectedCourseId={setSelectedCourseId}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedPriority={selectedPriority}
                    setSelectedPriority={setSelectedPriority}
                    selectedDueDate={selectedDueDate}
                    setSelectedDueDate={setSelectedDueDate}
                    newTitle={newTitle}
                    setNewTitle={setNewTitle}
                    onSubmit={handleAddTask}
                    savingTask={savingTask}
                    error={error}
                  />
                </section>

                <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                  <SectionHeader
                    title={`Tasks on ${selectedDate}`}
                    subtitle="Only tasks that match the selected date and course filter are shown."
                  />
                  <TaskList
                    tasks={tasksForSelectedDate}
                    coursesById={coursesById}
                    toggleTaskStatus={toggleTaskStatus}
                    editTask={editTask}
                    deleteTask={deleteTask}
                  />
                </section>
              </>
            )}

            {activeSection === 'courses' && (
              <>
                <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                  <SectionHeader
                    title="Your courses"
                    subtitle="List the classes you are taking this term and link tasks to them."
                  />
                  <CoursesForm
                    newCourseName={newCourseName}
                    setNewCourseName={setNewCourseName}
                    newCourseCode={newCourseCode}
                    setNewCourseCode={setNewCourseCode}
                    newCourseSemester={newCourseSemester}
                    setNewCourseSemester={setNewCourseSemester}
                    onSubmit={handleAddCourse}
                    savingCourse={savingCourse}
                  />
                </section>

                <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                  <SectionHeader
                    title="Current courses"
                    subtitle="Use these when planning tasks and projects across the semester."
                  />
                  <CoursesGrid courses={courses} />
                </section>
              </>
            )}

            {activeSection === 'calendar' && (
              <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                <SectionHeader
                  title="Calendar (coming soon)"
                  subtitle="For now you can move between dates using the date pickers on the Dashboard and Tasks views. A full calendar view can be added later."
                />
              </section>
            )}

            {activeSection === 'projects' && (
              <section className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4">
                <SectionHeader
                  title="Projects (placeholder)"
                  subtitle="Here you could group tasks into long-term projects like thesis, capstone or group work."
                />
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

type SidebarProps = {
  active: Section;
  onChange: (s: Section) => void;
  email: string | null;
  onLogout: () => void;
  loggingOut: boolean;
};

function Sidebar({ active, onChange, email, onLogout, loggingOut }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-60 flex-col bg-gradient-to-b from-[#f3fbff] via-[#f7fdf9] to-[#fdf7ff]">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-300 via-cyan-300 to-sky-400 flex items-center justify-center text-white text-sm font-bold">
            P
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              PlanIt Student
            </span>
            <span className="text-[11px] text-slate-500">
              Courses, assignments, exams
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        <SidebarButton
          label="Dashboard"
          icon="D"
          active={active === 'overview'}
          onClick={() => onChange('overview')}
        />
        <SidebarButton
          label="Tasks"
          icon="T"
          active={active === 'tasks'}
          onClick={() => onChange('tasks')}
        />
        <SidebarButton
          label="Courses"
          icon="C"
          active={active === 'courses'}
          onClick={() => onChange('courses')}
        />
        <SidebarButton
          label="Calendar"
          icon="L"
          active={active === 'calendar'}
          onClick={() => onChange('calendar')}
        />
        <SidebarButton
          label="Projects"
          icon="P"
          active={active === 'projects'}
          onClick={() => onChange('projects')}
        />
      </nav>

      <div className="px-4 pb-4 pt-3 border-t border-slate-100 text-[11px]">
        <div className="flex flex-col mb-2">
          <span className="text-slate-500">Logged in</span>
          <span className="text-emerald-700 truncate max-w-[10rem]">
            {email}
          </span>
        </div>
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-red-400 text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition disabled:opacity-60"
        >
          {loggingOut ? 'Signing out...' : 'Log out'}
        </button>
      </div>
    </aside>
  );
}

type SidebarButtonProps = {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
};

function SidebarButton({ label, icon, active, onClick }: SidebarButtonProps) {
  const base =
    'w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all duration-150 ';
  const activeClasses =
    'bg-gradient-to-r from-emerald-50 via-cyan-50 to-sky-50 border-emerald-100 text-emerald-800 shadow-sm';
  const inactiveClasses =
    'bg-transparent border-transparent text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-800';

  return (
    <button onClick={onClick} className={base + (active ? activeClasses : inactiveClasses)}>
      <span className="h-5 w-5 rounded-md bg-gradient-to-tr from-emerald-300 via-cyan-300 to-sky-400 flex items-center justify-center text-[11px] text-white">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

type HeaderProps = {
  activeSection: Section;
  email: string | null;
};

function Header({ activeSection, email }: HeaderProps) {
  const title =
    activeSection === 'overview'
      ? 'Your study overview'
      : activeSection === 'tasks'
      ? 'Your tasks'
      : activeSection === 'courses'
      ? 'Your courses'
      : activeSection === 'calendar'
      ? 'Your calendar'
      : 'Your projects';

  const subtitle =
    activeSection === 'overview'
      ? 'Plan your day across courses.'
      : activeSection === 'tasks'
      ? 'See and manage all tasks.'
      : activeSection === 'courses'
      ? 'Keep track of your classes.'
      : activeSection === 'calendar'
      ? 'View work across the term.'
      : 'Group long-term work.';

  return (
    <header className="border-b border-slate-100 px-5 md:px-7 py-3 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-500">Today</span>
        <span className="text-sm md:text-base font-semibold text-slate-900 tracking-tight">
          {title}
        </span>
        <span className="text-[11px] text-slate-500">{subtitle}</span>
      </div>
      <div className="hidden sm:flex flex-col items-end text-[11px]">
        <span className="text-slate-500">Signed in as</span>
        <span className="text-emerald-700 font-medium truncate max-w-[10rem]">
          {email}
        </span>
      </div>
    </header>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle: string;
};

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
      <div>
        <h2 className="text-sm md:text-base font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

type OverviewFocusCardProps = {
  courses: Course[];
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  filterCourseId: string | 'all';
  setFilterCourseId: (v: string | 'all') => void;
  selectedCourseId: string | 'all';
  setSelectedCourseId: (v: string | 'all') => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedPriority: string;
  setSelectedPriority: (v: string) => void;
  selectedDueDate: string;
  setSelectedDueDate: (v: string) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  savingTask: boolean;
  error: string | null;
};

function OverviewFocusCard(props: OverviewFocusCardProps) {
  const {
    courses,
    selectedDate,
    setSelectedDate,
    filterCourseId,
    setFilterCourseId,
    selectedCourseId,
    setSelectedCourseId,
    selectedType,
    setSelectedType,
    selectedPriority,
    setSelectedPriority,
    selectedDueDate,
    setSelectedDueDate,
    newTitle,
    setNewTitle,
    onSubmit,
    savingTask,
    error,
  } = props;

  return (
    <div className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Today&apos;s study focus
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Plan assignments, readings and quizzes for one day, across your courses.
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex flex-col items-center justify-center text-[10px] font-semibold text-emerald-800">
            <span>Student</span>
            <span>planner</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1.3fr,1.1fr] gap-3">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            required
            placeholder='Write a task like "CS165 – Homework 3"...'
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <select
              className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={selectedCourseId}
              onChange={(e) =>
                setSelectedCourseId(
                  e.target.value === 'all' ? 'all' : e.target.value
                )
              }
            >
              <option value="all">No course / General</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code || c.name}
                </option>
              ))}
            </select>

            <select
              className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="assignment">Assignment</option>
              <option value="reading">Reading</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>

            <PriorityBar
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Due date</span>
              <input
                type="date"
                className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={savingTask}
              className="ml-auto px-4 py-2 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 text-xs md:text-sm font-semibold text-slate-900 shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {savingTask ? 'Adding...' : 'Add task'}
            </button>
          </div>

          {error && (
            <p className="text-[11px] text-rose-500 mt-1">
              {error}
            </p>
          )}
        </form>

        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 border border-slate-100 px-3 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">Date</span>
              <input
                type="date"
                className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">Course filter</span>
              <select
                className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={filterCourseId}
                onChange={(e) =>
                  setFilterCourseId(
                    e.target.value === 'all' ? 'all' : e.target.value
                  )
                }
              >
                <option value="all">All courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2 text-[11px]">
            <span className="text-slate-500">
              Use the filters to focus on one course at a time while planning your day.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type PriorityBarProps = {
  selectedPriority: string;
  setSelectedPriority: (v: string) => void;
};

function PriorityBar({ selectedPriority, setSelectedPriority }: PriorityBarProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-slate-100 px-1 py-1">
      {[1, 2, 3].map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setSelectedPriority(String(p))}
          className={
            'flex-1 text-[11px] px-2 py-1 rounded-full transition ' +
            (selectedPriority === String(p)
              ? p === 1
                ? 'bg-rose-500 text-white'
                : p === 2
                ? 'bg-amber-400 text-slate-900'
                : 'bg-emerald-400 text-slate-900'
              : 'text-slate-500')
          }
        >
          {p === 1 ? 'P1' : p === 2 ? 'P2' : 'P3'}
        </button>
      ))}
    </div>
  );
}

type ProgressCardProps = {
  totalForDay: number;
  completedForDay: number;
  progress: number;
};

function ProgressCard({ totalForDay, completedForDay, progress }: ProgressCardProps) {
  const remaining = totalForDay - completedForDay;

  return (
    <div className="rounded-2xl bg-[#faf8f5] border border-slate-100 shadow-sm px-4 py-4 flex flex-col justify-between gap-3">
      <div>
        <h2 className="text-sm md:text-base font-semibold text-slate-900 tracking-tight">
          Progress for this day
        </h2>
        <p className="text-[11px] md:text-xs text-slate-500 mt-1">
          Track how many tasks you have completed for the selected date and course filter.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">
            {completedForDay} of {totalForDay} tasks completed
          </span>
          <span className="font-semibold text-emerald-700">{progress}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 py-2">
            <div className="text-[10px] text-emerald-700">Total tasks</div>
            <div className="text-base font-semibold text-emerald-800">
              {totalForDay}
            </div>
          </div>
          <div className="rounded-xl bg-sky-50 border border-sky-100 py-2">
            <div className="text-[10px] text-sky-700">Completed</div>
            <div className="text-base font-semibold text-sky-800">
              {completedForDay}
            </div>
          </div>
          <div className="rounded-xl bg-cyan-50 border border-cyan-100 py-2">
            <div className="text-[10px] text-cyan-700">Remaining</div>
            <div className="text-base font-semibold text-cyan-800">
              {remaining}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type TasksFormBarProps = {
  courses: Course[];
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  filterCourseId: string | 'all';
  setFilterCourseId: (v: string | 'all') => void;
  selectedCourseId: string | 'all';
  setSelectedCourseId: (v: string | 'all') => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedPriority: string;
  setSelectedPriority: (v: string) => void;
  selectedDueDate: string;
  setSelectedDueDate: (v: string) => void;
  newTitle: string;
  setNewTitle: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  savingTask: boolean;
  error: string | null;
};

function TasksFormBar(props: TasksFormBarProps) {
  const {
    courses,
    selectedDate,
    setSelectedDate,
    filterCourseId,
    setFilterCourseId,
    selectedCourseId,
    setSelectedCourseId,
    selectedType,
    setSelectedType,
    selectedPriority,
    setSelectedPriority,
    selectedDueDate,
    setSelectedDueDate,
    newTitle,
    setNewTitle,
    onSubmit,
    savingTask,
    error,
  } = props;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col md:flex-row gap-2 items-stretch mt-2"
    >
      <div className="flex-1 flex flex-col gap-2">
        <input
          type="text"
          required
          placeholder="New task title..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <select
            className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            value={selectedCourseId}
            onChange={(e) =>
              setSelectedCourseId(
                e.target.value === 'all' ? 'all' : e.target.value
              )
            }
          >
            <option value="all">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code || c.name}
              </option>
            ))}
          </select>

          <select
            className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="assignment">Assignment</option>
            <option value="reading">Reading</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
            <option value="other">Other</option>
          </select>

          <PriorityBar
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
          />
        </div>
      </div>

      <div className="flex flex-col md:w-72 gap-2">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Date</span>
            <input
              type="date"
              className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Filter</span>
            <select
              className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={filterCourseId}
              onChange={(e) =>
                setFilterCourseId(
                  e.target.value === 'all' ? 'all' : e.target.value
                )
              }
            >
              <option value="all">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Due</span>
            <input
              type="date"
              className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
              value={selectedDueDate}
              onChange={(e) => setSelectedDueDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={savingTask}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 text-xs md:text-sm font-semibold text-slate-900 shadow-sm hover:shadow-md disabled:opacity-60"
          >
            {savingTask ? 'Adding...' : 'Add'}
          </button>
        </div>

        {error && (
          <p className="text-[11px] text-rose-500 mt-1">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

type TaskListProps = {
  tasks: Task[];
  coursesById: Record<string, Course>;
  toggleTaskStatus: (t: Task) => void;
  editTask: (t: Task) => void;
  deleteTask: (id: string) => void;
};

function TaskList({
  tasks,
  coursesById,
  toggleTaskStatus,
  editTask,
  deleteTask,
}: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No tasks for this selection. Add one above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((t) => {
        const course = t.course_id ? coursesById[t.course_id] : undefined;
        const priorityLabel =
          t.priority === 1 ? 'P1' : t.priority === 3 ? 'P3' : 'P2';
        const priorityColor =
          t.priority === 1
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : t.priority === 3
            ? 'bg-slate-50 text-slate-700 border-slate-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';

        return (
          <div
            key={t.id}
            className="group border border-slate-200 bg-white rounded-xl px-3 py-2.5 flex items-start justify-between text-xs md:text-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 hover:bg-emerald-50/60"
          >
            <div className="flex flex-col">
              <div
                className={
                  'font-medium ' +
                  (t.status === 'done'
                    ? 'line-through text-slate-400'
                    : 'text-slate-900 group-hover:text-emerald-900')
                }
              >
                {t.title}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 items-center mt-1">
                {course && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {course.code || course.name}
                  </span>
                )}
                {t.type && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {t.type}
                  </span>
                )}
                {t.due_date && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    due {new Date(t.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {(t.status || 'todo').toUpperCase()} •{' '}
                {new Date(t.created_at).toLocaleString()}
              </div>
            </div>
            <div className="ml-3 flex flex-col gap-1 items-end">
              <div
                className={
                  'px-2 py-0.5 rounded-full text-[10px] border ' + priorityColor
                }
              >
                {priorityLabel}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => toggleTaskStatus(t)}
                  className={
                    'px-2 py-1 rounded-full text-[10px] border transition ' +
                    (t.status === 'done'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200')
                  }
                >
                  {t.status === 'done' ? 'Undo' : 'Done'}
                </button>
                <button
                  onClick={() => editTask(t)}
                  className="px-2 py-1 rounded-full text-[10px] bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="px-2 py-1 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type CoursesFormProps = {
  newCourseName: string;
  setNewCourseName: (v: string) => void;
  newCourseCode: string;
  setNewCourseCode: (v: string) => void;
  newCourseSemester: string;
  setNewCourseSemester: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  savingCourse: boolean;
};

function CoursesForm({
  newCourseName,
  setNewCourseName,
  newCourseCode,
  setNewCourseCode,
  newCourseSemester,
  setNewCourseSemester,
  onSubmit,
  savingCourse,
}: CoursesFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-3 mt-2"
    >
      <div className="flex flex-col gap-2">
        <input
          type="text"
          required
          placeholder="Course name (e.g. CS165 – Programming)"
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Code (e.g. CS165)"
            className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
            value={newCourseCode}
            onChange={(e) => setNewCourseCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Semester (e.g. Fall 2025)"
            className="text-xs border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            value={newCourseSemester}
            onChange={(e) => setNewCourseSemester(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-end md:justify-end">
        <button
          type="submit"
          disabled={savingCourse}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 text-xs md:text-sm font-semibold text-slate-900 shadow-sm hover:shadow-md disabled:opacity-60"
        >
          {savingCourse ? 'Adding...' : 'Add course'}
        </button>
      </div>
    </form>
  );
}

type CoursesGridProps = {
  courses: Course[];
};

function CoursesGrid({ courses }: CoursesGridProps) {
  if (courses.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No courses yet. Add at least one course above to start linking your tasks.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      {courses.map((c) => (
        <div
          key={c.id}
          className="border border-slate-200 bg-white rounded-xl px-3 py-3 text-xs md:text-sm flex flex-col gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900 tracking-tight">
              {c.name}
            </div>
            <span
              className="rounded-full text-[10px] px-2 py-0.5 border"
              style={{
                borderColor:
                  c.color === 'sky'
                    ? '#0ea5e9'
                    : c.color === 'cyan'
                    ? '#06b6d4'
                    : c.color === 'amber'
                    ? '#f59e0b'
                    : c.color === 'violet'
                    ? '#8b5cf6'
                    : c.color === 'rose'
                    ? '#f43f5e'
                    : '#10b981',
                color:
                  c.color === 'sky'
                    ? '#0369a1'
                    : c.color === 'cyan'
                    ? '#0e7490'
                    : c.color === 'amber'
                    ? '#92400e'
                    : c.color === 'violet'
                    ? '#5b21b6'
                    : c.color === 'rose'
                    ? '#9f1239'
                    : '#047857',
                backgroundColor:
                  c.color === 'sky'
                    ? '#e0f2fe'
                    : c.color === 'cyan'
                    ? '#cffafe'
                    : c.color === 'amber'
                    ? '#fef3c7'
                    : c.color === 'violet'
                    ? '#ede9fe'
                    : c.color === 'rose'
                    ? '#ffe4e6'
                    : '#d1fae5',
              }}
            >
              {c.code || 'Course'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between mt-1">
            <span>
              Semester:{' '}
              <span className="text-slate-700 font-medium">
                {c.semester || 'Not set'}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
