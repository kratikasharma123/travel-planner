import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import AuthPromptModal from '../components/AuthPromptModal.jsx';

const navItems = [
  { href: '#services', label: 'Services' },
  { href: '#destinations', label: 'Destinations' },
  { href: '#booking', label: 'Booking' },
  { href: '#reviews', label: 'Reviews' },
];

function PublicLayout() {
  const [authPrompt, setAuthPrompt] = useState(null);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf3] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-[#fffaf3]/90 backdrop-blur">
        <nav className="app-container flex flex-wrap items-center justify-between gap-3 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white">
              ✈
            </span>
            TripSafar
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-orange-500">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setAuthPrompt('login')}
              className="rounded-full px-4 py-2 text-slate-700 hover:bg-white"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthPrompt('register')}
              className="rounded-full border border-orange-300 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:border-orange-500 hover:text-orange-600"
            >
              Sign up
            </button>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {authPrompt && <AuthPromptModal mode={authPrompt} onClose={() => setAuthPrompt(null)} />}
    </div>
  );
}

export default PublicLayout;
