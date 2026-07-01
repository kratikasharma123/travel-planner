function AdminSection({ eyebrow, title, description, action, children }) {
  return (
    <section className="app-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
          {description && <p className="section-description">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default AdminSection;
