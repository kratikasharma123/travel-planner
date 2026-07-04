function AdminSection({ eyebrow, title, description, action, children }) {
  return (
    <section className="rounded-[24px] border border-orange-100/80 bg-white p-6 shadow-xl shadow-orange-100/45">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow && <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">{eyebrow}</p>}
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">{title}</h2>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default AdminSection;
