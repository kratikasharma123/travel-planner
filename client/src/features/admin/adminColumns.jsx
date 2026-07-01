import AdminStatusBadge from './components/AdminStatusBadge.jsx';

export function dateCell(value) {
  return value ? String(value).slice(0, 10) : '—';
}

export function statusColumn(key = 'status') {
  return { key, label: 'Status', render: (row) => <AdminStatusBadge value={row[key]} /> };
}
