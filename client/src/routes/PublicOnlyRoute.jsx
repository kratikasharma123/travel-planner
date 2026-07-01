import { Navigate, Outlet } from 'react-router-dom';
import { canChooseAdminDashboard } from '../features/admin/adminConstants.js';
import { useAuth } from '../hooks/useAuth.js';

function PublicOnlyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <p className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-soft">
          Loading...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={canChooseAdminDashboard(user) ? '/choose-dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
