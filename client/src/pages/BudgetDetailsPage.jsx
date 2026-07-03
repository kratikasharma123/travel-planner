import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChartPie, Edit3, PiggyBank, ReceiptText, Sparkles, Wallet } from 'lucide-react';
import { currencyFormat } from '../utils/budgetCalculations.js';

function BudgetDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const budget = location.state?.budget;

  if (!budget) {
    return (
      <section className="rounded-[2rem] border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/40">
        <Wallet className="mx-auto h-14 w-14 text-orange-500" />
        <h1 className="mt-4 text-2xl font-black text-slate-950">Budget details unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">Open this page from a budget card so TripSafar can load the selected budget.</p>
        <Link to="/budget" className="mt-5 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white">Back to Budget</Link>
      </section>
    );
  }

  const currency = budget.currency || 'USD';
  const total = Number(budget.totalBudget || budget.totalEstimate || 0);
  const savings = Number(budget.savingsTarget || 0);
  const remaining = Math.max(total - savings, 0);

  return (
    <section className="grid gap-6">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-700 ring-1 ring-orange-100 transition hover:bg-orange-50 hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-200 p-6 shadow-2xl shadow-orange-100 sm:p-8 lg:p-10">
        <ChartPie className="absolute right-10 top-10 h-24 w-24 rotate-12 text-white/70" />
        <div className="relative max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600 shadow-sm"><Sparkles className="h-4 w-4" />Budget details</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{budget.name}</h1>
          <p className="mt-4 text-5xl font-black text-orange-500">{currencyFormat(total, currency)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/budget" state={{ budget }} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600"><Edit3 className="h-4 w-4" />Edit Budget</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Budget', value: currencyFormat(total, currency), icon: Wallet },
          { label: 'Savings Target', value: currencyFormat(savings, currency), icon: PiggyBank },
          { label: 'Remaining After Savings', value: currencyFormat(remaining, currency), icon: ReceiptText },
          { label: 'Dates', value: `${budget.startDate || 'Flexible'}${budget.endDate ? ` → ${budget.endDate}` : ''}`, icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/40">
              <Icon className="h-6 w-6 text-orange-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Budget context</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Planning details</h2>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <p className="rounded-2xl bg-orange-50 p-4"><span className="font-black text-slate-950">Category:</span> {budget.category || 'General travel'}</p>
          <p className="rounded-2xl bg-orange-50 p-4"><span className="font-black text-slate-950">Status:</span> {budget.status || 'Active'}</p>
          <p className="rounded-2xl bg-orange-50 p-4"><span className="font-black text-slate-950">Created:</span> {budget.createdAt ? new Date(budget.createdAt).toLocaleDateString() : 'Recently'}</p>
          <p className="rounded-2xl bg-orange-50 p-4"><span className="font-black text-slate-950">Currency:</span> {currency}</p>
        </div>
      </section>
    </section>
  );
}

export default BudgetDetailsPage;
