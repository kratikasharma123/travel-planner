import { Link, Navigate } from 'react-router-dom';
import { canChooseAdminDashboard } from '../features/admin/adminConstants.js';
import { useAuth } from '../hooks/useAuth.js';

function ChooseDashboardPage() {
  const { user } = useAuth();

  if (!canChooseAdminDashboard(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="page-stack">
      <div className="app-card text-center">
        <p className="section-eyebrow">Choose workspace</p>
        <h1 className="section-title">Where do you want to go?</h1>
        <p className="section-description mx-auto">
          Your account has admin access. You can manage the platform or continue using the travel
          planner as a normal user.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link
          to="/admin"
          className="app-card transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-soft"
        >
          <span className="text-4xl" aria-hidden="true">
            🛡️
          </span>
          <h2 className="mt-4 text-2xl font-bold text-slate-950">Open Admin Panel</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manage users, trips, bookings, content, support, reviews, settings, reports, and audit
            logs.
          </p>
          <span className="mt-5 inline-flex rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white">
            Go to admin
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="app-card transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-soft"
        >
          <span className="text-4xl" aria-hidden="true">
            🧳
          </span>
          <h2 className="mt-4 text-2xl font-bold text-slate-950">Continue as User</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Plan trips, manage budgets, chat with the assistant, and explore destinations from the
            user dashboard.
          </p>
          <span className="mt-5 inline-flex rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Go to dashboard
          </span>
        </Link>
      </div>
    </section>
  );
}

export default ChooseDashboardPage;
