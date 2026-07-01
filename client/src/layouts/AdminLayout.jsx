import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getVisibleAdminTabs } from '../features/admin/adminConstants.js';
import { useAuth } from '../hooks/useAuth.js';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const visibleTabs = getVisibleAdminTabs(user);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950 text-white shadow-lg shadow-slate-950/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/admin" className="text-xl font-bold">
                TravelAI Admin
              </Link>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-slate-200">
                {String(user?.role || 'admin').replaceAll('_', ' ')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl bg-white/10 px-4 py-2">
                <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-300">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                User app
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Admin sections">
            {visibleTabs.map((item) => (
              <NavLink
                key={item.key}
                to={`/admin?tab=${item.key}`}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive && location.search.includes(`tab=${item.key}`)
                      ? 'bg-white text-slate-950'
                      : 'text-slate-300 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
