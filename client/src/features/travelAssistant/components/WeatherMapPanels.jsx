function WeatherMapPanels({ weather }) {
  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-6 shadow-soft backdrop-blur-xl sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Weather</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">7-day forecast</h2>
        </div>
        {weather?.isFallback && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Fallback</span>}
      </div>

      {weather?.error && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{weather.error}</p>}
      <p className="mt-3 text-sm font-bold text-slate-500">{weather?.location || 'Destination'}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Current</p>
          <p className="mt-1 font-black text-slate-950">{weather?.current || 'Fallback weather'}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Temp / feels</p>
          <p className="mt-1 font-black text-slate-950">{weather?.temperature ?? '--'}°C / {weather?.feelsLike ?? '--'}°C</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Rain / humidity</p>
          <p className="mt-1 font-black text-slate-950">{weather?.rainChance ?? 0}% / {weather?.humidity ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Wind / air</p>
          <p className="mt-1 font-black text-slate-950">{weather?.windSpeed ?? 0} kph • {weather?.airQuality || 'Good'}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {weather?.forecast?.slice(0, 7).map((day) => (
          <div key={day.day} className="flex justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-sm">
            <span className="font-bold text-slate-700">{day.day}</span>
            <span className="text-right text-slate-600">{day.condition} • {day.minTemperature}°/{day.maxTemperature}°C • {day.rainChance}% rain</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeatherMapPanels;
