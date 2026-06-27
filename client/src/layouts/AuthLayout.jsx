import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="text-2xl font-bold">
          TravelAI Planner
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-primary-100">Secure travel workspace</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight">
            Login, save preferences, and continue planning smarter trips.
          </h1>
          <p className="mt-4 text-slate-300">
            Authentication is powered by HttpOnly JWT cookies, protected routes, and a basic user profile foundation.
          </p>
        </div>
      </aside>
      <main className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
