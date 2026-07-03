const toneMap = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  sent: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  saved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  scheduled: 'bg-amber-50 text-amber-700 ring-amber-200',
  open: 'bg-orange-50 text-orange-700 ring-orange-200',
  draft: 'bg-stone-50 text-stone-700 ring-stone-200',
  suspended: 'bg-orange-50 text-orange-700 ring-orange-200',
  disabled: 'bg-stone-100 text-stone-600 ring-stone-300',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  reported: 'bg-rose-50 text-rose-700 ring-rose-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
  closed: 'bg-stone-100 text-stone-600 ring-stone-300',
  archived: 'bg-stone-100 text-stone-600 ring-stone-300',
};

function AdminStatusBadge({ value }) {
  const status = value || 'unknown';
  const tone = toneMap[status] || 'bg-stone-50 text-stone-700 ring-stone-200';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${tone}`}
    >
      {String(status).replaceAll('_', ' ')}
    </span>
  );
}

export default AdminStatusBadge;
