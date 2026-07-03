import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { useAuth } from '../hooks/useAuth.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { to: '/planner', label: 'AI Trip Planner', icon: '✦' },
  { to: '/destinations', label: 'Destinations', icon: '◎' },
  { to: '/budget', label: 'Budget Planner', icon: '◍' },
  { to: '/my-trips', label: 'My Trips', icon: '▣' },
  { to: '/bookings', label: 'Bookings', icon: '◫' },
  { to: '/saved-places', label: 'Saved Places', icon: '♡' },
  { to: '/profile', label: 'Profile', icon: '◐' },
];

function getStoredFavoriteCount() {
  return JSON.parse(window.localStorage.getItem('tripsafar-favorite-destinations') || '[]').length;
}

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem('tripsafar-dashboard-theme') === 'dark'
  );
  const [favoriteCount, setFavoriteCount] = useState(getStoredFavoriteCount);

  useEffect(() => {
    window.localStorage.setItem('tripsafar-dashboard-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    function syncFavoriteCount() {
      setFavoriteCount(getStoredFavoriteCount());
    }

    window.addEventListener('storage', syncFavoriteCount);
    window.addEventListener('tripsafar-favorites-updated', syncFavoriteCount);

    return () => {
      window.removeEventListener('storage', syncFavoriteCount);
      window.removeEventListener('tripsafar-favorites-updated', syncFavoriteCount);
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  function renderNavItems({ onNavigate } = {}) {
    return navItems.map((item) => (
      <NavLink
        key={`${item.to}-${item.label}`}
        to={item.to}
        state={item.state}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-bold transition ${
            isActive && item.label !== 'Settings'
              ? 'bg-[#FFFBF5] text-[#FB923C] shadow-sm'
              : 'text-[#222222]/65 hover:bg-[#FFFBF5] hover:text-[#FB923C]'
          }`
        }
      >
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-sm shadow-sm ring-1 ring-black/5">
          {item.icon}
        </span>
        {item.label}
      </NavLink>
    ));
  }

  return (
    <div className={`min-h-screen lg:pl-[220px] ${isDarkMode ? 'dashboard-dark bg-slate-950 text-slate-100' : 'bg-[#FAFAF7] text-[#222222]'}`}>
      <header className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 ${
        isDarkMode ? 'border-white/10 bg-slate-950/90' : 'border-black/5 bg-[#FAFAF7]/90'
      }`}>
        <div className="mx-auto flex max-w-[1600px] items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-black/5 bg-white text-xl font-black text-[#222222] shadow-sm lg:hidden"
            aria-label="Open dashboard menu"
          >
            ☰
          </button>

          <div className="relative hidden flex-1 md:block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#FB923C]">⌕</span>
            <input
              type="search"
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-11 text-sm font-semibold shadow-sm outline-none transition placeholder:text-[#222222]/35 focus:border-[#FB923C]/30 focus:ring-4 focus:ring-[#FFFBF5]"
              placeholder="Search destinations, trips, places..."
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              className={`grid h-11 w-11 place-items-center rounded-2xl border text-lg shadow-sm transition ${
                isDarkMode ? 'border-white/10 bg-slate-900 text-amber-300' : 'border-black/5 bg-white text-[#222222]'
              }`}
              type="button"
              onClick={() => setIsDarkMode((current) => !current)}
              aria-pressed={isDarkMode}
              aria-label="Toggle dark mode"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? '☀' : '◐'}
            </button>
            <button
              className={`relative grid h-11 w-11 place-items-center rounded-2xl border text-lg shadow-sm transition ${
                isDarkMode ? 'border-white/10 bg-slate-900 text-rose-300' : 'border-black/5 bg-white text-[#FF7A59]'
              }`}
              type="button"
              onClick={() => navigate('/saved-places')}
              aria-label={`${favoriteCount} saved destinations`}
              title={`${favoriteCount} saved destinations`}
            >
              ♥
              {favoriteCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF7A59] px-1 text-[10px] font-black text-white ring-2 ring-white">
                  {favoriteCount}
                </span>
              )}
            </button>
            <div className="hidden items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5 sm:flex">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFBF5] text-sm font-black text-[#FB923C]">
                {(user?.name || 'T').charAt(0)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-black text-[#222222]">{user?.name || 'TripSafar User'}</p>
                <p className="text-xs font-semibold text-[#222222]/45">Traveler</p>
              </div>
              <span className="text-[#222222]/35">⌄</span>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close dashboard menu overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col overflow-hidden bg-[#F8F8F4] p-5 text-[#222222] shadow-2xl shadow-black/10 transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-xl font-black tracking-tight text-[#222222]">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFFBF5] text-2xl">🌴</span>
            <span>Trip<span className="text-[#FB923C]">Safar</span></span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFBF5] text-2xl text-[#FB923C] lg:hidden"
            aria-label="Close dashboard menu"
          >
            ×
          </button>
        </div>

        <nav className="mt-5 grid gap-1" aria-label="Dashboard navigation">
          {renderNavItems({ onNavigate: () => setIsMenuOpen(false) })}
        </nav>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-black text-[#222222]/65 transition hover:bg-[#FFFBF5] hover:text-[#FB923C]"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <ScrollReveal autoReveal className="contents" selector="section, article, [data-auto-reveal]" stagger={0.05}>
          <Outlet />
        </ScrollReveal>
      </main>
    </div>
  );
}

export default DashboardLayout;
