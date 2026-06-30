import { currencyFormat, estimateSavingsCompletionDate } from '../../../utils/budgetCalculations.js';

function SavingsGoalCard({ budget, progress, expenses = [] }) {
  return (
    <section className="app-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Savings goal</p>
          <h2 className="section-title">Target progress</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{progress.percentage.toFixed(1)}% complete</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Target</p><p className="mt-2 text-xl font-bold text-slate-950">{currencyFormat(progress.target, budget?.currency)}</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Saved</p><p className="mt-2 text-xl font-bold text-slate-950">{currencyFormat(progress.saved, budget?.currency)}</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Remaining</p><p className="mt-2 text-xl font-bold text-slate-950">{currencyFormat(progress.remaining, budget?.currency)}</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Estimated date</p><p className="mt-2 text-xl font-bold text-slate-950">{estimateSavingsCompletionDate(budget, expenses)}</p></div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.percentage}%` }} />
      </div>
    </section>
  );
}

export default SavingsGoalCard;
