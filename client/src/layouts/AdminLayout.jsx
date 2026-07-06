import { createElement, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
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
  { key: 'audit', tabKey: 'audit', label: 'Audit Logs', icon: ShieldCheck, to: '/admin/audit' },
];

const ROUTE_TAB_MAP = {
  users: 'users',
  trips: 'trips',
  bookings: 'bookings',
  'ai-conversations': 'ai',
  destinations: 'content',
  content: 'content',
  audit: 'audit',
};

const searchableAdminSections = [
  { label: 'Overview', description: 'Admin dashboard and analytics', to: '/admin', keywords: ['dashboard', 'analytics', 'home'] },
  { label: 'Users', description: 'Search and manage platform users', to: '/admin/users', keywords: ['user', 'roles', 'status'] },
  { label: 'Trips', description: 'Approve and manage travel plans', to: '/admin/trips', keywords: ['trip', 'itinerary', 'travel'] },
  { label: 'Bookings', description: 'Flights, hotels, activities, and transport', to: '/admin/bookings', keywords: ['booking', 'flight', 'hotel'] },
  { label: 'AI Usage', description: 'Assistant prompts and usage logs', to: '/admin/ai-conversations', keywords: ['ai', 'prompt', 'conversation'] },
  { label: 'Destinations', description: 'Destination and content management', to: '/admin/destinations', keywords: ['destination', 'content', 'place'] },
  { label: 'Audit Logs', description: 'Admin activity and changes', to: '/admin/audit', keywords: ['audit', 'logs', 'activity'] },
];

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
  const [adminSearch, setAdminSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem('tripsafar-admin-theme') === 'dark');
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
  const adminSearchTerm = adminSearch.trim().toLowerCase();
  const accessibleAdminSections = useMemo(
    () => searchableAdminSections.filter((section) => navItems.some((item) => item.to === section.to)),
    [navItems]
  );
  const adminSearchResults = useMemo(() => {
    if (!adminSearchTerm) return [];

    return accessibleAdminSections
      .filter((section) => {
        const haystack = [section.label, section.description, ...section.keywords].join(' ').toLowerCase();
        return haystack.includes(adminSearchTerm);
      })
      .slice(0, 6);
  }, [accessibleAdminSections, adminSearchTerm]);

  useEffect(() => {
    window.localStorage.setItem('tripsafar-admin-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('admin-dark-root', isDarkMode);

    return () => document.documentElement.classList.remove('admin-dark-root');
  }, [isDarkMode]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  function closeSearch() {
    window.setTimeout(() => setIsSearchOpen(false), 120);
  }

  function openSearchResult(result) {
    setAdminSearch('');
    setIsSearchOpen(false);
    navigate(result.to);
  }

  function handleAdminSearchSubmit(event) {
    event.preventDefault();
    const firstResult = adminSearchResults[0];
    if (firstResult) openSearchResult(firstResult);
  }

  return (
    <div className={`admin-shell min-h-screen ${isDarkMode ? 'admin-dark bg-slate-950 text-slate-100' : 'bg-[#F8F7F4] text-stone-950'}`}>
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
          <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-slate-950/90' : 'border-orange-100/70 bg-[#F8F7F4]/90'}`}>
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
                  <form className="relative min-w-0 flex-1 lg:max-w-sm" onSubmit={handleAdminSearchSubmit}>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="search"
                      value={adminSearch}
                      onChange={(event) => {
                        setAdminSearch(event.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      onBlur={closeSearch}
                      placeholder="Search users, trips, bookings..."
                      className="h-12 w-full rounded-[14px] border border-orange-100 bg-white pl-11 pr-10 text-sm font-semibold text-stone-700 outline-none shadow-sm transition placeholder:text-stone-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      aria-label="Search admin"
                    />
                    {adminSearch && (
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setAdminSearch('')}
                        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-stone-400 transition hover:bg-orange-50 hover:text-orange-600"
                        aria-label="Clear admin search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {isSearchOpen && adminSearchTerm && (
                      <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-[18px] border border-orange-100 bg-white shadow-2xl shadow-orange-100/70">
                        {adminSearchResults.length > 0 ? (
                          <div className="p-2">
                            {adminSearchResults.map((result) => (
                              <button
                                key={result.to}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => openSearchResult(result)}
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-orange-50"
                              >
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                                  <Search className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-black text-stone-950">{result.label}</span>
                                  <span className="block truncate text-xs font-semibold text-stone-500">{result.description}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-sm font-semibold text-stone-500">
                            Filtering current admin table for “{adminSearch.trim()}”
                          </div>
                        )}
                      </div>
                    )}
                  </form>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDarkMode((current) => !current)}
                      className={`grid h-12 w-12 place-items-center rounded-[14px] shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:text-orange-600 ${isDarkMode ? 'bg-orange-500 text-white' : 'bg-white text-stone-600'}`}
                      aria-pressed={isDarkMode}
                      aria-label="Toggle dark mode"
                      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <Link
                      to="/admin/destinations?create=1"
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
              <Outlet context={{ adminSearch }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
