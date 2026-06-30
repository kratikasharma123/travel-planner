import { currencyFormat, getCostBreakdown, getMonthlySpendingRows, objectToChartRows } from './budgetCalculations.js';

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function rowsToCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function rowsToHtmlTable(headers, rows) {
  return `<table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

export function exportExpensesCsv(expenses = [], filename = 'budget-expenses.csv') {
  const headers = ['Title', 'Category', 'Amount', 'Date', 'Vendor', 'Status', 'Cost Type', 'Notes'];
  const rows = expenses.map((expense) => [
    expense.title,
    expense.category,
    expense.amount,
    expense.expenseDate,
    expense.vendor,
    expense.status,
    expense.costType,
    expense.notes,
  ]);
  downloadFile(filename, rowsToCsv(headers, rows), 'text/csv;charset=utf-8;');
}

export function exportExpensesExcel(expenses = [], filename = 'budget-expenses.xls') {
  const headers = ['Title', 'Category', 'Amount', 'Date', 'Vendor', 'Status', 'Cost Type'];
  const rows = expenses.map((expense) => [expense.title, expense.category, expense.amount, expense.expenseDate, expense.vendor, expense.status, expense.costType]);
  downloadFile(filename, rowsToHtmlTable(headers, rows), 'application/vnd.ms-excel');
}

export function buildBudgetReportRows(type, budget, summary, expenses = []) {
  const currency = budget?.currency || 'USD';

  if (type === 'budget') {
    return {
      headers: ['Metric', 'Value'],
      rows: [
        ['Budget Name', budget?.name || 'Budget'],
        ['Category', budget?.category || 'general'],
        ['Total Budget', currencyFormat(summary.totalBudget, currency)],
        ['Estimated Cost', currencyFormat(summary.totalEstimatedCost, currency)],
        ['Actual Cost', currencyFormat(summary.totalActualCost, currency)],
        ['Remaining Budget', currencyFormat(summary.remainingBudget, currency)],
        ['Utilization', `${summary.utilization.toFixed(1)}%`],
        ['Savings Amount', currencyFormat(summary.savingsAmount, currency)],
      ],
    };
  }

  if (type === 'category') {
    return {
      headers: ['Category', 'Amount'],
      rows: objectToChartRows(summary.totals.byCategory).map((row) => [row.name, currencyFormat(row.value, currency)]),
    };
  }

  if (type === 'vendor') {
    return {
      headers: ['Vendor', 'Amount'],
      rows: objectToChartRows(summary.totals.byVendor).map((row) => [row.name, currencyFormat(row.value, currency)]),
    };
  }

  if (type === 'monthly') {
    return {
      headers: ['Month', 'Estimated', 'Actual', 'Total'],
      rows: getMonthlySpendingRows(expenses).map((row) => [row.month, currencyFormat(row.estimated, currency), currencyFormat(row.actual, currency), currencyFormat(row.total, currency)]),
    };
  }

  if (type === 'savings') {
    return {
      headers: ['Metric', 'Value'],
      rows: [
        ['Savings Target', currencyFormat(budget?.savingsTarget || 0, currency)],
        ['Current Savings Capacity', currencyFormat(summary.savingsAmount, currency)],
        ['Remaining To Target', currencyFormat(Math.max(Number(budget?.savingsTarget || 0) - summary.savingsAmount, 0), currency)],
      ],
    };
  }

  if (type === 'breakdown') {
    return {
      headers: ['Cost Type', 'Amount', 'Percentage'],
      rows: getCostBreakdown(expenses).map((row) => [row.type, currencyFormat(row.amount, currency), `${row.percentage.toFixed(1)}%`]),
    };
  }

  return {
    headers: ['Title', 'Category', 'Amount', 'Date', 'Vendor', 'Status', 'Cost Type', 'Notes'],
    rows: expenses.map((expense) => [expense.title, expense.category, currencyFormat(expense.amount, currency), expense.expenseDate, expense.vendor, expense.status, expense.costType, expense.notes]),
  };
}

export function exportBudgetReport(type, format, budget, summary, expenses = []) {
  const report = buildBudgetReportRows(type, budget, summary, expenses);
  const baseName = `${budget?.name || 'budget'}-${type}-report`.toLowerCase().replaceAll(' ', '-');

  if (format === 'csv') {
    downloadFile(`${baseName}.csv`, rowsToCsv(report.headers, report.rows), 'text/csv;charset=utf-8;');
    return;
  }

  if (format === 'excel') {
    downloadFile(`${baseName}.xls`, rowsToHtmlTable(report.headers, report.rows), 'application/vnd.ms-excel');
    return;
  }

  printBudgetReport(budget, summary, expenses, type);
}

export function printBudgetReport(budget, summary, expenses = [], type = 'budget') {
  const report = window.open('', '_blank');
  if (!report) return;
  const rows = buildBudgetReportRows(type, budget, summary, expenses);

  report.document.write(`
    <html><head><title>${budget?.name || 'Budget'} Report</title><style>body{font-family:Arial;padding:24px;color:#0f172a}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f8fafc}</style></head>
    <body>
      <h1>${budget?.name || 'Budget'} ${type} Report</h1>
      <p>Total Budget: ${summary.totalBudget}</p>
      <p>Estimated Cost: ${summary.totalEstimatedCost}</p>
      <p>Actual Cost: ${summary.totalActualCost}</p>
      <p>Remaining: ${summary.remainingBudget}</p>
      ${rowsToHtmlTable(rows.headers, rows.rows)}
    </body></html>
  `);
  report.document.close();
  report.print();
}
