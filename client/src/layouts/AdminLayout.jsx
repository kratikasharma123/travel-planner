import { createElement, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Bell,
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Gauge,
  Headphones,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plane,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { getVisibleAdminTabs } from '../features/admin/adminConstants.js';
import { useAuth } from '../hooks/useAuth.js';

const SIDEBAR_ITEMS = [
  { key: 'overview', tabKey: 'overview', label: 'Overview', icon: Gauge, to: '/admin' },
  { key: 'users', tabKey: 'users', label: 'Users', icon: Users, to: '/admin/users' },
  { key: 'trips', tabKey: 'trips', label: 'Trips', icon: Plane, to: '/admin/trips' },
  { key: 'bookings', tabKey: 'bookings', label: 'Bookings', icon: CalendarDays, to: '/admin/bookings' },
  { key: 'ai-conversations', tabKey: 'ai', label: 'AI Usage', icon: Bot, to: '/admin/ai-conversations' },
  { key: 'destinations', tabKey: 'content', label: 'Destinations', icon: MapPin, to: '/admin/destinations' },
  { key: 'budgets', tabKey: 'reports', label: 'Budgets', icon: CircleDollarSign, to: '/admin/budgets' },
  { key: 'content', tabKey: 'content', label: 'Content', icon: FileText, to: '/admin/content' },
  { key: 'reports', tabKey: 'reports', label: 'Reports', icon: ClipboardList, to: '/admin/reports' },
  { key: 'notifications', tabKey: 'notifications', label: 'Notifications', icon: Bell, to: '/admin/notifications' },
  { key: 'support', tabKey: 'support', label: 'Support', icon: Headphones, to: '/admin/support' },
  { key: 'reviews', tabKey: 'reviews', label: 'Reviews', icon: Star, to: '/admin/reviews' },
  { key: 'settings', tabKey: 'settings', label: 'Settings', icon: Settings, to: '/admin/settings' },
  { key: 'audit', tabKey: 'audit', label: 'Audit Logs', icon: ShieldCheck, to: '/admin/audit' },
];

const ROUTE_TAB_MAP = {
  users: 'users',
  trips: 'trips',
  bookings: 'bookings',
  'ai-conversations': 'ai',
  destinations: 'content',
  budgets: 'reports',
  content: 'content',
  reports: 'reports',
  notifications: 'notifications',
  support: 'support',
  reviews: 'reviews',
  settings: 'settings',
  audit: 'audit',
};

function getInitials(name = '', email = '') {
  const source = name || email || 'Admin';
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}

function formatRole(role) {
  return String(role || 'admin').replaceAll('_', ' ');
}

function getActiveNavKey(location) {
  const pathSegment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];

  if (pathSegment) return pathSegment;

  const tab = new URLSearchParams(location.search).get('tab');
  if (!tab || tab === 'overview') return 'overview';

  if (tab === 'ai') return 'ai-conversations';
  return tab;
}

function AdminSidebar({ user, items, activeKey, isCollapsed, onToggleCollapse, onLogout, onCloseMobile, isMobile = false }) {
  const sidebarWidth = isMobile ? 280 : isCollapsed ? 92 : 280;
  const userName = user?.name || 'Admin';
  const initials = getInitials(userName, user?.email);

  return (
    <Motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#0B1120] text-white shadow-2xl shadow-slate-950/30"
    >
      <div className="flex h-20 items-center justify-between gap-3 border-b border-white/10 px-5">
        <Link to="/admin" onClick={onCloseMobile} className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="h-5 w-5" />
          </span>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight">TripSafar Admin</p>
              <p className="mt-0.5 inline-flex rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-200 ring-1 ring-orange-400/20">
                {formatRole(user?.role)}
              </p>
            </div>
          )}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="grid h-10 w-10 place-items-center rounded-2xl text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close admin menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="grid h-9 w-9 place-items-center rounded-2xl text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
        {items.map((item) => {
          const isActive = activeKey === item.key || (!activeKey && item.key === 'overview');

          return (
            <Motion.div key={item.key} whileHover={{ x: isCollapsed ? 0 : 3 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={item.to}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm font-bold transition ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-lg shadow-orange-500/10'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && (
                  <Motion.span
                    layoutId={isMobile ? undefined : 'admin-sidebar-active'}
                    className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-orange-500"
                  />
                )}
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${isActive ? 'bg-orange-50 text-orange-600' : 'bg-white/5 text-slate-400 group-hover:text-orange-200'}`}>
                  {createElement(item.icon, { className: 'h-4 w-4' })}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </Motion.div>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        {!isCollapsed && (
          <Motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 p-4"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-lg shadow-emerald-300/60" />
              System Status
            </div>
            <p className="mt-2 text-sm font-bold text-white">All services operational</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">AI, bookings, and admin APIs are online.</p>
          </Motion.div>
        )}

        <div className={`flex items-center gap-3 rounded-[20px] bg-white/5 p-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange-500 text-sm font-black text-white">
            {initials}
          </span>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{userName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || formatRole(user?.role)}</p>
            </div>
          )}
        </div>

        <div className={`grid gap-2 ${isCollapsed ? 'place-items-center' : ''}`}>
          <Link
            to="/dashboard"
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'User app' : undefined}
          >
            <LayoutGrid className="h-4 w-4" />
            {!isCollapsed && 'User app'}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-orange-500/15 hover:text-orange-200 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </div>
    </Motion.aside>
  );
}

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const visibleTabs = getVisibleAdminTabs(user);
  const visibleTabKeys = useMemo(() => new Set(visibleTabs.map((item) => item.key)), [visibleTabs]);
  const navItems = useMemo(
    () => SIDEBAR_ITEMS.filter((item) => visibleTabKeys.has(item.tabKey)),
    [visibleTabKeys]
  );
  const activeKey = getActiveNavKey(location);
  const activeItem = navItems.find((item) => item.key === activeKey || item.tabKey === ROUTE_TAB_MAP[activeKey]) || navItems[0];
  const userName = user?.name || 'Admin';
  const initials = getInitials(userName, user?.email);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-950">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen lg:block">
          <AdminSidebar
            user={user}
            items={navItems}
            activeKey={activeItem?.key || 'overview'}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((current) => !current)}
            onLogout={handleLogout}
          />
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <>
              <Motion.button
                type="button"
                aria-label="Close admin menu overlay"
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
              />
              <Motion.div
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <AdminSidebar
                  user={user}
                  items={navItems}
                  activeKey={activeItem?.key || 'overview'}
                  isCollapsed={false}
                  onLogout={handleLogout}
                  onCloseMobile={() => setIsMobileOpen(false)}
                  isMobile
                />
              </Motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-orange-100/70 bg-[#F8F7F4]/90 backdrop-blur-xl">
            <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8 2xl:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-stone-700 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:text-orange-600 lg:hidden"
                    aria-label="Open admin menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Travel SaaS Admin</p>
                    <h1 className="text-xl font-black tracking-tight text-stone-950 sm:text-2xl">
                      {activeItem?.label || 'Overview'}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 lg:max-w-3xl lg:flex-row lg:items-center lg:justify-end">
                  <label className="relative min-w-0 flex-1 lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="search"
                      placeholder="Search users, trips, bookings..."
                      className="h-12 w-full rounded-[14px] border border-orange-100 bg-white pl-11 pr-4 text-sm font-semibold text-stone-700 outline-none shadow-sm transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-stone-600 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:text-orange-600"
                      aria-label="Toggle theme"
                    >
                      <Moon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="relative grid h-12 w-12 place-items-center rounded-[14px] bg-white text-stone-600 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:text-orange-600"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
                    </button>
                    <Link
                      to="/admin/destinations"
                      className="hidden h-12 items-center gap-2 rounded-[14px] bg-orange-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 sm:inline-flex"
                    >
                      <Plus className="h-4 w-4" />
                      Quick Action
                    </Link>
                    <div className="flex h-12 items-center gap-3 rounded-[14px] bg-white px-3 shadow-sm ring-1 ring-orange-100">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-xs font-black text-white">
                        {initials}
                      </span>
                      <div className="hidden min-w-0 sm:block">
                        <p className="truncate text-sm font-black text-stone-950">{userName}</p>
                        <p className="truncate text-xs font-semibold capitalize text-stone-500">{formatRole(user?.role)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:py-8 xl:px-8 2xl:px-10">
            <div className="mx-auto max-w-[1500px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
