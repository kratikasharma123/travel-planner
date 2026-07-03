import { getBudgetTone } from '../../../utils/budgetCalculations.js';

function BudgetProgressBar({ utilization = 0 }) {
  const tone = getBudgetTone(utilization);
  const width = Math.min(utilization, 100);

  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Budget utilization</p>
          <p className={`mt-2 text-3xl font-black ${tone.textClass}`}>{utilization.toFixed(1)}%</p>
        </div>
        <span className={`rounded-full border px-4 py-2 text-xs font-black ${tone.softClass}`}>{tone.label}</span>
      </div>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-orange-50 ring-1 ring-orange-100">
        <div className={`h-full rounded-full transition-all ${tone.bgClass}`} style={{ width: `${width}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs font-black text-slate-400">
        <span>0%</span>
        <span>80%</span>
        <span>95%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default BudgetProgressBar;
