import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import AssistantPage from '../pages/AssistantPage.jsx';
import BudgetPage from '../pages/BudgetPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import DestinationsPage from '../pages/DestinationsPage.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MyTripsPage from '../pages/MyTripsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import PlannerPage from '../pages/PlannerPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import AdminRoute from './AdminRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/my-trips" element={<MyTripsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
