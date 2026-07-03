import { Clock, MapPin, Sunrise, Sun, Sunset, Moon } from 'lucide-react';

const blocks = [
  { key: 'morning', label: 'Morning', icon: Sunrise, tone: 'bg-orange-50 text-orange-600' },
  { key: 'afternoon', label: 'Afternoon', icon: Sun, tone: 'bg-amber-50 text-amber-600' },
  { key: 'evening', label: 'Evening', icon: Sunset, tone: 'bg-emerald-50 text-emerald-600' },
  { key: 'night', label: 'Night', icon: Moon, tone: 'bg-teal-50 text-teal-700' },
];

function ItineraryDayCard({ dayNumber, items = [], onMove }) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-100/70 sm:p-6">
      <div className="absolute bottom-0 left-8 top-24 w-px bg-gradient-to-b from-orange-300 via-amber-200 to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-black text-white shadow-lg shadow-orange-100">
            {dayNumber}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">AI timeline</p>
            <h3 className="text-2xl font-black text-slate-950">Day {dayNumber}</h3>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600">
          <Clock className="h-4 w-4" />
          {items.length} planned stops
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {blocks.map((block) => {
          const blockItems = items.filter((item) => item.timeBlock === block.key);
          const Icon = block.icon;

          return (
            <div key={block.key} className="relative pl-8">
              <span className={`absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full ring-4 ring-white ${block.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{block.label}</p>
                <div className="mt-3 grid gap-3">
                  {blockItems.map((item) => (
                    <div key={item._id || `${item.title}-${item.sortOrder}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-50 transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                          {item.locationName && (
                            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
                              <MapPin className="h-3.5 w-3.5" />
                              {item.locationName}
                            </p>
                          )}
                        </div>
                        {onMove && (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => onMove(item, -1)} className="rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-600">↑</button>
                            <button type="button" onClick={() => onMove(item, 1)} className="rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-600">↓</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {blockItems.length === 0 && <p className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-500">No {block.label.toLowerCase()} plans yet.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default ItineraryDayCard;
