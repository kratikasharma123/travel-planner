import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-600">This route does not exist in the Milestone 2 app shell.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary-500 px-5 py-3 font-semibold text-white hover:bg-primary-600"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
