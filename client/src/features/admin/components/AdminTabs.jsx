function AdminTabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-3xl bg-white p-2 shadow-soft">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default AdminTabs;
