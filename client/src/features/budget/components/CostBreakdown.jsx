import { currencyFormat } from '../../../utils/budgetCalculations.js';

function CostBreakdown({ rows = [], currency = 'USD' }) {
  return (
    <section className="app-card">
      <p className="section-eyebrow">Cost breakdown</p>
      <h2 className="section-title">Fixed, variable, one-time, recurring</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <article key={row.type} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold capitalize text-slate-600">{row.type}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{currencyFormat(row.amount, currency)}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(row.percentage, 100)}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">{row.percentage.toFixed(1)}%</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CostBreakdown;
