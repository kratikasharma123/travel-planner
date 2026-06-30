import { Suspense, lazy } from 'react';

const BudgetCharts = lazy(() => import('./charts/BudgetCharts.jsx'));

function AnalyticsSection(props) {
  return (
    <section className="app-card">
      <p className="section-eyebrow">Analytics</p>
      <h2 className="section-title">Charts & spending trends</h2>
      <Suspense fallback={<p className="mt-5 rounded-2xl bg-slate-50 p-4 text-slate-600">Loading charts...</p>}>
        <BudgetCharts {...props} />
      </Suspense>
    </section>
  );
}

export default AnalyticsSection;
