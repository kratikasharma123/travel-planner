import { Link, Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-100">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold text-slate-950">
            TravelAI Planner
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <Link to="/login" className="rounded-full px-4 py-2 hover:bg-slate-100">
              Login
            </Link>
            <Link to="/register" className="rounded-full bg-primary-500 px-4 py-2 text-white hover:bg-primary-600">
              Start Planning
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
