import { Link, Outlet, useLocation } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal.jsx';

function AuthLayout() {
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';

  return (
    <ScrollReveal autoReveal className={`relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#fef3c7_100%)] text-slate-900 ${isRegisterPage ? '' : 'grid lg:grid-cols-[1fr_1.05fr]'}`} selector="aside, main, section, form, article" stagger={0.08}>
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-teal-200/35 blur-3xl" />

      {!isRegisterPage && <aside className="relative hidden p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
        <Link to="/" className="flex items-center gap-3 text-2xl font-black text-slate-950">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200">
            ✈
          </span>
          TripSafar
        </Link>

        <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-orange-200/40">
          <img
            src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1000&q=90"
            alt="Travel planning poster with scenic destination"
            className="h-[34rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="absolute left-7 right-7 top-7 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600 backdrop-blur">
              Secure trip hub
            </span>
            <span className="rounded-full bg-slate-950/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
              AI powered
            </span>
          </div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-orange-200">
              Continue planning
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight tracking-tight">
              Login, save trips, and build your next story.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
              Access itineraries, budgets, saved destinations, and planning tools from one
              beautiful workspace.
            </p>
          </div>
        </div>
      </aside>}

      <main className={`relative flex items-center justify-center px-4 py-8 sm:px-6 lg:py-10 ${isRegisterPage ? 'min-h-screen' : ''}`}>
        <div className={`w-full ${isRegisterPage ? 'max-w-7xl' : 'max-w-xl'}`}>
          <Outlet />
        </div>
      </main>
    </ScrollReveal>
  );
}

export default AuthLayout;
