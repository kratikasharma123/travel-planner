const blocks = ['morning', 'afternoon', 'evening', 'night'];

function ItineraryDayCard({ dayNumber, items = [], onMove }) {
  return (
    <article className="app-card-compact">
      <h3 className="text-lg font-bold text-slate-950">Day {dayNumber}</h3>
      <div className="mt-4 grid gap-3">
        {blocks.map((block) => {
          const blockItems = items.filter((item) => item.timeBlock === block);
          return (
            <div key={block} className="rounded-2xl bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">{block}</p>
              <div className="mt-2 grid gap-2">
                {blockItems.map((item) => (
                  <div key={item._id || `${item.title}-${item.sortOrder}`} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                        {item.locationName && <p className="mt-1 text-xs font-semibold text-slate-500">📍 {item.locationName}</p>}
                      </div>
                      {onMove && <div className="flex gap-1"><button type="button" onClick={() => onMove(item, -1)} className="rounded-full bg-white px-2 py-1 text-xs">↑</button><button type="button" onClick={() => onMove(item, 1)} className="rounded-full bg-white px-2 py-1 text-xs">↓</button></div>}
                    </div>
                  </div>
                ))}
                {blockItems.length === 0 && <p className="text-sm text-slate-500">No {block} plans yet.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default ItineraryDayCard;
