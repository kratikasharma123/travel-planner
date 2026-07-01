function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const normalized = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
}

export function recordsToCsv(records = [], columns = []) {
  const keys = columns.length ? columns.map((column) => column.key) : Object.keys(records[0] || {});
  const labels = columns.length ? columns.map((column) => column.label || column.key) : keys;
  const rows = records.map((record) => keys.map((key) => escapeCsvValue(record[key])).join(','));
  return [labels.map(escapeCsvValue).join(','), ...rows].join('\n');
}

export function downloadCsv(filename, records = [], columns = []) {
  const csv = recordsToCsv(records, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filterRows(rows = [], search = '', fields = []) {
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => {
    const values = fields.length ? fields.map((field) => row[field]) : Object.values(row);
    return values.some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(term)
    );
  });
}

export function applySelectFilter(rows = [], key, value) {
  if (!key || !value) return rows;
  return rows.filter((row) => String(row[key] ?? '') === String(value));
}
