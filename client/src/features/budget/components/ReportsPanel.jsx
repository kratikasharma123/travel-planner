const reportTypes = [
  ['budget', 'Budget Summary'],
  ['expenses', 'Expense Summary'],
  ['category', 'Category Report'],
  ['vendor', 'Vendor Report'],
  ['monthly', 'Monthly Report'],
  ['savings', 'Savings Report'],
  ['breakdown', 'Cost Breakdown'],
];

function ReportsPanel({ reportType, onReportTypeChange, onExport, disabled }) {
  return (
    <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-xl shadow-orange-100/40 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Reports</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Generate and export</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Download polished summaries for budgets, vendors, savings, and monthly spends.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select value={reportType} onChange={onReportTypeChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 sm:min-w-64">
          {reportTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled} onClick={() => onExport('pdf')} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">PDF</button>
          <button type="button" disabled={disabled} onClick={() => onExport('excel')} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60">Excel</button>
          <button type="button" disabled={disabled} onClick={() => onExport('csv')} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60">CSV</button>
        </div>
      </div>
    </section>
  );
}

export default ReportsPanel;
