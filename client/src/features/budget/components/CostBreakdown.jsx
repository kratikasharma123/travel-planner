import { currencyFormat } from '../../../utils/budgetCalculations.js';

function CostBreakdown({ rows = [], currency = 'USD' }) {
  return (
    <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Cost breakdown</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Fixed, variable, one-time, recurring</h2>
      {rows.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-slate-600">Add expenses to see your spending split by cost type.</p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <article key={row.type} className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">{row.type}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{currencyFormat(row.amount, currency)}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(row.percentage, 100)}%` }} />
              </div>
              <p className="mt-2 text-sm font-black text-slate-500">{row.percentage.toFixed(1)}%</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CostBreakdown;
