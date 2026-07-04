function WeatherMapPanels({ weather, locations = [] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur-xl sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Weather</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">7-day forecast</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Current</p>
            <p className="mt-1 font-black text-slate-950">{weather?.current || 'Fallback weather'}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Temp</p>
            <p className="mt-1 font-black text-slate-950">{weather?.temperature ?? '--'}°C</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Rain</p>
            <p className="mt-1 font-black text-slate-950">{weather?.rainChance ?? 0}%</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Air</p>
            <p className="mt-1 font-black text-slate-950">{weather?.airQuality || 'Good'}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          {weather?.forecast?.slice(0, 7).map((day) => (
            <div key={day.day} className="flex justify-between rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
              <span className="font-bold text-slate-700">{day.day}</span>
              <span className="text-slate-600">{day.temperature}°C • {day.rainChance}% rain</span>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur-xl sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Interactive map</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Saved locations & route planning
        </h2>
        <div className="mt-5 rounded-[2rem] border border-dashed border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center text-sm font-semibold text-slate-600">
          Map provider ready. Add VITE_MAPS_API_KEY for live maps.
        </div>
        <div className="mt-4 grid gap-2">
          {locations.slice(0, 5).map((loc) => (
            <div key={loc._id} className="rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
              <span className="font-black text-slate-950">{loc.name}</span>{' '}
              <span className="text-slate-500">{loc.locationType}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default WeatherMapPanels;
