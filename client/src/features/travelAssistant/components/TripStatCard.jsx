function TripStatCard({ label, value, icon, helper }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 p-5 shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100 opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
          {helper && <p className="mt-2 text-sm leading-5 text-slate-600">{helper}</p>}
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-xl shadow-sm ring-1 ring-orange-100">
          {icon}
        </span>
      </div>
    </article>
  );
}

export default TripStatCard;
