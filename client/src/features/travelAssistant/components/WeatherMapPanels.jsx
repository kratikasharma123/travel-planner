function WeatherMapPanels({ weather, locations = [] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="app-card">
        <p className="section-eyebrow">Weather</p>
        <h2 className="section-title">7-day forecast</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="app-card-compact"><p className="text-sm text-slate-500">Current</p><p className="font-bold text-slate-950">{weather?.current || 'Fallback weather'}</p></div>
          <div className="app-card-compact"><p className="text-sm text-slate-500">Temp</p><p className="font-bold text-slate-950">{weather?.temperature ?? '--'}°C</p></div>
          <div className="app-card-compact"><p className="text-sm text-slate-500">Rain</p><p className="font-bold text-slate-950">{weather?.rainChance ?? 0}%</p></div>
          <div className="app-card-compact"><p className="text-sm text-slate-500">Air</p><p className="font-bold text-slate-950">{weather?.airQuality || 'Good'}</p></div>
        </div>
        <div className="mt-5 grid gap-2">{weather?.forecast?.slice(0, 7).map((day) => <div key={day.day} className="flex justify-between rounded-2xl bg-slate-50 p-3 text-sm"><span>{day.day}</span><span>{day.temperature}°C • {day.rainChance}% rain</span></div>)}</div>
      </section>
      <section className="app-card">
        <p className="section-eyebrow">Interactive map</p>
        <h2 className="section-title">Saved locations & route planning</h2>
        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">Map provider ready. Add VITE_MAPS_API_KEY for live maps.</div>
        <div className="mt-4 grid gap-2">{locations.slice(0, 5).map((loc) => <div key={loc._id} className="rounded-2xl bg-slate-50 p-3 text-sm"><span className="font-semibold text-slate-950">{loc.name}</span> <span className="text-slate-500">{loc.locationType}</span></div>)}</div>
      </section>
    </div>
  );
}

export default WeatherMapPanels;
