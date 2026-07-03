function AdminPagination({ page = 1, total = 0, limit = 25, onPageChange }) {
  const pages = Math.max(Math.ceil(total / limit), 1);
  if (pages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;
