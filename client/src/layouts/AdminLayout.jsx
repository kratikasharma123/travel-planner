import { Link, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold">
            TravelAI Admin
          </Link>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
            Placeholder access — auth comes later
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
