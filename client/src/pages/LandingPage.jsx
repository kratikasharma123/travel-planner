import { Link } from 'react-router-dom';

function LandingPage() {
  const features = ['AI Trip Planner', 'Destination Discovery', 'Budget Planner', 'Saved Trips'];

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
      <div>
        <p className="section-eyebrow">
          Milestone 2 app shell
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Plan personalized trips with an AI SaaS travel workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          This is the first runnable TravelAI Planner shell. Full AI, auth, database, and trip logic will be implemented in future milestones.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/register" className="btn-primary">
            Start Planning
          </Link>
          <Link to="/dashboard" className="btn-secondary bg-white">
            View App Shell
          </Link>
        </div>
      </div>
      <div className="app-card">
        <h2 className="text-xl font-bold text-slate-950">Planned product areas</h2>
        <div className="mt-5 grid gap-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-2xl bg-slate-50 p-3.5 text-sm font-medium text-slate-700">
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
