function AdminErrorState({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700" role="alert">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-secondary border-rose-200 text-rose-700 hover:bg-rose-100"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminErrorState;
