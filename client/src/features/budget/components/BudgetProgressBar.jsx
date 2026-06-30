import { getBudgetTone } from '../../../utils/budgetCalculations.js';

function BudgetProgressBar({ utilization = 0 }) {
  const tone = getBudgetTone(utilization);
  const width = Math.min(utilization, 100);

  return (
    <div className="app-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Budget utilization</p>
          <p className={`mt-2 text-2xl font-bold ${tone.textClass}`}>{utilization.toFixed(1)}%</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.softClass}`}>{tone.label}</span>
      </div>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${tone.bgClass}`} style={{ width: `${width}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs font-semibold text-slate-500">
        <span>0%</span>
        <span>80%</span>
        <span>95%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default BudgetProgressBar;
