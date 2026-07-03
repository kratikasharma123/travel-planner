import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6">
      <section className="app-card max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600">404</p>
        <h1 className="section-title">Page not found</h1>
        <p className="section-description">This route does not exist in the Milestone 2 app shell.</p>
        <Link
          to="/"
          className="mt-5 inline-flex btn-primary"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
