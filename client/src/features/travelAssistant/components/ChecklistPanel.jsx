import { CheckCircle2, Circle, PackageCheck, Shirt, Sparkles } from 'lucide-react';

const categoryChips = ['Documents', 'Clothes', 'Health', 'Tech', 'Weather'];

function ChecklistPanel({ items = [], onSeed }) {
  const completed = items.filter((item) => item.isComplete).length;
  const percent = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50 p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/50 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Packing & essentials</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Travel checklist</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Generate destination-ready essentials for weather, documents, comfort, tech, and special travel needs.</p>

            <div className="mt-6 flex items-center gap-5">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-xl shadow-orange-100 ring-8 ring-orange-100/70">
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-500">{percent}%</p>
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">done</p>
                </div>
              </div>
              <div className="grid gap-2 text-sm font-bold text-slate-600">
                <span>{completed} packed</span>
                <span>{Math.max(items.length - completed, 0)} remaining</span>
              </div>
            </div>

            <button type="button" onClick={onSeed} className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-600">
              <Sparkles className="h-4 w-4" />
              Generate packing list
            </button>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {categoryChips.map((chip) => (
              <span key={chip} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600">
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-orange-50">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-400" style={{ width: `${percent}%` }} />
          </div>

          <div className="mt-5 grid gap-3">
            {items.slice(0, 8).map((item) => (
              <div key={item._id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <span className={item.isComplete ? 'text-emerald-500' : 'text-slate-300'}>
                  {item.isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-600">{item.category}</span>
                <span className="font-semibold text-slate-700">{item.title}</span>
              </div>
            ))}
            {items.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-orange-500 shadow-lg shadow-orange-100">
                  <Shirt className="h-8 w-8" />
                </div>
                <p className="mt-4 text-lg font-black text-slate-950">No essentials yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Let AI create a packing list based on your trip style and weather.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChecklistPanel;
