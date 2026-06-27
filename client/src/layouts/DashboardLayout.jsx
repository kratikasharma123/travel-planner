import { Link, NavLink, Outlet } from 'react-router-dom';

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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link to="/dashboard" className="text-xl font-bold text-slate-950">
          TravelAI Planner
        </Link>
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
        <p className="mt-6 hidden rounded-2xl bg-primary-50 p-4 text-sm text-primary-700 lg:block">
          Milestone 2 shell only. Data-backed features start in later milestones.
        </p>
      </aside>
      <main className="p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
