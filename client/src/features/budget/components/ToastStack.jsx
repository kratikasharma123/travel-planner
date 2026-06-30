const toastClasses = {
  danger: 'bg-rose-600',
  warning: 'bg-amber-500',
  success: 'bg-emerald-600',
  info: 'bg-slate-900',
};

function ToastStack({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 grid w-[min(360px,calc(100vw-2rem))] gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-soft ${toastClasses[toast.tone] || toastClasses.info}`}>
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button type="button" onClick={() => onDismiss(toast.id)} className="text-white/80 hover:text-white" aria-label="Dismiss notification">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
