import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner', label: 'AI Planner' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/budget', label: 'Budget' },
  { to: '/my-trips', label: 'My Trips' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/profile', label: 'Profile' },
];

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link to="/dashboard" className="text-xl font-bold text-slate-950">
          TravelAI Planner
        </Link>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">{user?.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </aside>
      <main className="p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
