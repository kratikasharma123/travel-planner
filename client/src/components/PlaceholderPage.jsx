function PlaceholderPage({ title, eyebrow = 'Milestone 2 app shell', description, plannedItems = [] }) {
  return (
    <section className="app-card">
      <p className="section-eyebrow">{eyebrow}</p>
      <div className="mt-3 max-w-3xl">
        <h1 className="section-title">{title}</h1>
        <p className="section-description">{description}</p>
      </div>

      {plannedItems.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plannedItems.map((item) => (
            <div key={item} className="app-card-compact">
              <p className="text-sm font-medium text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PlaceholderPage;
