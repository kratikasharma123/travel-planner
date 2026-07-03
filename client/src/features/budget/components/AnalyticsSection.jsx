import { Suspense, lazy } from 'react';

const BudgetCharts = lazy(() => import('./charts/BudgetCharts.jsx'));

function AnalyticsSection(props) {
  return (
    <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Analytics</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Charts & spending trends</h2>
      <Suspense fallback={<p className="mt-5 rounded-2xl bg-orange-50 p-4 font-semibold text-slate-600">Loading charts...</p>}>
        <BudgetCharts {...props} />
      </Suspense>
    </section>
  );
}

export default AnalyticsSection;
