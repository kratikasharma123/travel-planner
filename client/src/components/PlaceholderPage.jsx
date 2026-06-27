function PlaceholderPage({ title, eyebrow = 'Milestone 2 app shell', description, plannedItems = [] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">{eyebrow}</p>
      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </div>

      {plannedItems.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plannedItems.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PlaceholderPage;
