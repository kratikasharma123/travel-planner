const alertClasses = {
  danger: 'border-rose-100 bg-rose-50 text-rose-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  info: 'border-orange-100 bg-orange-50 text-orange-700',
};

function AlertBanner({ alerts = [] }) {
  if (!alerts.length) return null;

  return (
    <div className="grid gap-3">
      {alerts.map((alert, index) => (
        <div key={`${alert.message}-${index}`} className={`rounded-2xl border p-4 text-sm font-bold shadow-sm ${alertClasses[alert.tone] || alertClasses.info}`}>
          {alert.message}
        </div>
      ))}
    </div>
  );
}

export default AlertBanner;
