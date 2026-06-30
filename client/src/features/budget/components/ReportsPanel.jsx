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
    <section className="app-card">
      <p className="section-eyebrow">Reports</p>
      <h2 className="section-title">Generate and export</h2>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select value={reportType} onChange={onReportTypeChange} className="form-control sm:min-w-64">
          {reportTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled} onClick={() => onExport('pdf')} className="btn-primary">PDF</button>
          <button type="button" disabled={disabled} onClick={() => onExport('excel')} className="btn-secondary">Excel</button>
          <button type="button" disabled={disabled} onClick={() => onExport('csv')} className="btn-secondary">CSV</button>
        </div>
      </div>
    </section>
  );
}

export default ReportsPanel;
