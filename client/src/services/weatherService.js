const fallbackWeather = {
  current: 'Pleasant travel weather',
  condition: 'Pleasant travel weather',
  temperature: 24,
  feelsLike: 24,
  rainChance: 20,
  windSpeed: 12,
  humidity: 55,
  uv: 4,
  airQuality: 'Good',
  forecast: [
    { day: 'Day 1', date: '', condition: 'Partly cloudy', temperature: 24, minTemperature: 20, maxTemperature: 28, rainChance: 20 },
    { day: 'Day 2', date: '', condition: 'Sunny', temperature: 25, minTemperature: 21, maxTemperature: 29, rainChance: 25 },
    { day: 'Day 3', date: '', condition: 'Cloudy', temperature: 23, minTemperature: 20, maxTemperature: 27, rainChance: 30 },
    { day: 'Day 4', date: '', condition: 'Clear', temperature: 24, minTemperature: 19, maxTemperature: 28, rainChance: 15 },
    { day: 'Day 5', date: '', condition: 'Sunny', temperature: 26, minTemperature: 22, maxTemperature: 30, rainChance: 10 },
    { day: 'Day 6', date: '', condition: 'Partly cloudy', temperature: 25, minTemperature: 21, maxTemperature: 29, rainChance: 20 },
    { day: 'Day 7', date: '', condition: 'Partly cloudy', temperature: 24, minTemperature: 20, maxTemperature: 28, rainChance: 25 },
  ],
  isFallback: true,
  error: '',
};

function getDestination(trip) {
  return trip?.city || trip?.customDestination?.name || trip?.destination?.name || trip?.country || '';
}

function getAirQualityLabel(airQuality = {}) {
  const usEpaIndex = Number(airQuality['us-epa-index'] || 0);
  if (!usEpaIndex) return 'Good';
  if (usEpaIndex <= 2) return 'Good';
  if (usEpaIndex === 3) return 'Moderate';
  if (usEpaIndex === 4) return 'Unhealthy for sensitive groups';
  if (usEpaIndex === 5) return 'Unhealthy';
  return 'Hazardous';
}

function fallbackFor(destination, error = '') {
  return { ...fallbackWeather, location: destination || 'Destination', isFallback: true, error };
}

export async function getWeatherSummaryForTrip(trip) {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const destination = getDestination(trip);

  if (!destination) return fallbackFor('Destination', 'Add a destination to load weather.');
  if (!apiKey) return fallbackFor(destination, 'VITE_WEATHER_API_KEY is not configured.');

  try {
    const params = new URLSearchParams({ key: apiKey, q: destination, days: '7', aqi: 'yes', alerts: 'no' });
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?${params.toString()}`);
    if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
    const data = await response.json();
    const current = data.current || {};

    return {
      current: current.condition?.text || 'Weather available',
      condition: current.condition?.text || 'Weather available',
      conditionIcon: current.condition?.icon || '',
      temperature: Math.round(current.temp_c || 0),
      feelsLike: Math.round(current.feelslike_c || current.temp_c || 0),
      rainChance: data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0,
      windSpeed: Math.round(current.wind_kph || 0),
      humidity: Math.round(current.humidity || 0),
      uv: Number(current.uv || 0),
      airQuality: getAirQualityLabel(current.air_quality),
      location: [data.location?.name, data.location?.country].filter(Boolean).join(', ') || destination,
      localTime: data.location?.localtime || '',
      forecast: (data.forecast?.forecastday || []).map((day, index) => ({
        day: day.date || `Day ${index + 1}`,
        date: day.date || '',
        condition: day.day?.condition?.text || 'Forecast',
        conditionIcon: day.day?.condition?.icon || '',
        temperature: Math.round(day.day?.avgtemp_c || 0),
        minTemperature: Math.round(day.day?.mintemp_c || 0),
        maxTemperature: Math.round(day.day?.maxtemp_c || 0),
        rainChance: day.day?.daily_chance_of_rain || 0,
      })),
      isFallback: false,
      error: '',
    };
  } catch (error) {
    return fallbackFor(destination, error?.message || 'Unable to load live weather.');
  }
}
