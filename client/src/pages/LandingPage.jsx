import { Link } from 'react-router-dom';

function LandingPage() {
  const features = ['AI Trip Planner', 'Destination Discovery', 'Budget Planner', 'Saved Trips'];

  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600">
          Milestone 2 app shell
        </p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
          Plan personalized trips with an AI SaaS travel workspace.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          This is the first runnable TravelAI Planner shell. Full AI, auth, database, and trip logic will be implemented in future milestones.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-full bg-primary-500 px-6 py-3 font-semibold text-white hover:bg-primary-600">
            Start Planning
          </Link>
          <Link to="/dashboard" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
            View App Shell
          </Link>
        </div>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold text-slate-950">Planned product areas</h2>
        <div className="mt-5 grid gap-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
