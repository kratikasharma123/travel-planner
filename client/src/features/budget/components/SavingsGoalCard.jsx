import { currencyFormat, estimateSavingsCompletionDate } from '../../../utils/budgetCalculations.js';

function SavingsGoalCard({ budget, progress, expenses = [] }) {
  const percentage = Math.min(progress.percentage, 100);

  return (
    <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white via-orange-50/50 to-emerald-50 p-5 shadow-xl shadow-orange-100/40 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Savings goal</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Target progress</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Track how much room you still have before your target is complete.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">{progress.percentage.toFixed(1)}% complete</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Target</p><p className="mt-2 text-xl font-black text-slate-950">{currencyFormat(progress.target, budget?.currency)}</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Saved</p><p className="mt-2 text-xl font-black text-slate-950">{currencyFormat(progress.saved, budget?.currency)}</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Remaining</p><p className="mt-2 text-xl font-black text-slate-950">{currencyFormat(progress.remaining, budget?.currency)}</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Estimated date</p><p className="mt-2 text-xl font-black text-slate-950">{estimateSavingsCompletionDate(budget, expenses)}</p></div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-orange-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
      </div>
    </section>
  );
}

export default SavingsGoalCard;
