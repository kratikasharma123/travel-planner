const fallbackWeather = {
  current: 'Pleasant travel weather',
  temperature: 24,
  rainChance: 20,
  windSpeed: 12,
  airQuality: 'Good',
  forecast: [
    { day: 'Day 1', temperature: 24, rainChance: 20 },
    { day: 'Day 2', temperature: 25, rainChance: 25 },
    { day: 'Day 3', temperature: 23, rainChance: 30 },
    { day: 'Day 4', temperature: 24, rainChance: 15 },
    { day: 'Day 5', temperature: 26, rainChance: 10 },
    { day: 'Day 6', temperature: 25, rainChance: 20 },
    { day: 'Day 7', temperature: 24, rainChance: 25 },
  ],
  isFallback: true,
};

export async function getWeatherSummaryForTrip(trip) {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const destination = trip?.city || trip?.customDestination?.name || trip?.country;
  if (!apiKey || !destination) return { ...fallbackWeather, location: destination || 'Destination' };

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(destination)}&days=7&aqi=yes`);
    if (!response.ok) throw new Error('Weather request failed');
    const data = await response.json();
    return {
      current: data.current?.condition?.text || 'Weather available',
      temperature: Math.round(data.current?.temp_c || 0),
      rainChance: data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0,
      windSpeed: Math.round(data.current?.wind_kph || 0),
      airQuality: data.current?.air_quality ? 'Available' : 'Good',
      location: data.location?.name || destination,
      forecast: (data.forecast?.forecastday || []).map((day, index) => ({
        day: day.date || `Day ${index + 1}`,
        temperature: Math.round(day.day?.avgtemp_c || 0),
        rainChance: day.day?.daily_chance_of_rain || 0,
      })),
      isFallback: false,
    };
  } catch {
    return { ...fallbackWeather, location: destination, isFallback: true };
  }
}
