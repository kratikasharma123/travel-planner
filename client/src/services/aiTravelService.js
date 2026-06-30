const timeBlocks = ['morning', 'afternoon', 'evening', 'night'];

const destinationSeeds = [
  { destinationName: 'Bali', country: 'Indonesia', city: 'Ubud', estimatedBudget: 1200, bestTimeToVisit: 'April to October', rating: 4.8, popularAttractions: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Seminyak Beach'], travelTips: ['Book scooters carefully', 'Carry light rainwear', 'Respect temple dress codes'] },
  { destinationName: 'Kyoto', country: 'Japan', city: 'Kyoto', estimatedBudget: 1800, bestTimeToVisit: 'March to May, October to November', rating: 4.9, popularAttractions: ['Fushimi Inari', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera'], travelTips: ['Use public transport passes', 'Reserve popular restaurants', 'Start sightseeing early'] },
  { destinationName: 'Goa', country: 'India', city: 'Panaji', estimatedBudget: 650, bestTimeToVisit: 'November to February', rating: 4.6, popularAttractions: ['Baga Beach', 'Old Goa', 'Fort Aguada'], travelTips: ['Compare cab fares', 'Keep beach days flexible', 'Try local seafood'] },
];

function tripName(trip) {
  return trip?.title || trip?.customDestination?.name || trip?.city || 'your trip';
}

export async function sendTravelMessage({ message, trip, history = [] }) {
  const lower = message.toLowerCase();
  const name = tripName(trip);
  const topics = [];
  if (lower.includes('hotel')) topics.push('compare hotels near your daily activity clusters and prefer free cancellation.');
  if (lower.includes('food') || lower.includes('restaurant')) topics.push('try local food markets for breakfast and reserve one highly rated dinner.');
  if (lower.includes('budget') || lower.includes('cost')) topics.push('keep 15% of your budget as buffer and track transport + meals daily.');
  if (lower.includes('pack')) topics.push('pack documents, weather-appropriate layers, medicines, chargers, and a compact day bag.');
  if (lower.includes('safe') || lower.includes('safety')) topics.push('save emergency contacts, avoid isolated areas late at night, and keep digital document copies.');

  const response = topics.length
    ? `For ${name}, I recommend you ${topics.join(' Also, ')} I can turn this into a checklist or itinerary if you want.`
    : `For ${name}, I can help with destinations, itinerary, hotels, restaurants, attractions, transport, packing, budget, weather, and safety. A good next step is to share your dates, budget, interests, and traveler count.`;

  return {
    role: 'assistant',
    content: response,
    metadata: { generatedBy: 'mock-ready-ai', historyLength: history.length },
  };
}

export function generateItinerary({ trip, days = 3, interests = [] }) {
  const city = trip?.city || trip?.customDestination?.name || 'Destination';
  const preferred = interests.length ? interests : trip?.interests || ['culture', 'food', 'sightseeing'];
  const items = [];

  for (let day = 1; day <= Math.max(Number(days || 3), 1); day += 1) {
    timeBlocks.forEach((block, index) => {
      const theme = preferred[(day + index) % preferred.length] || 'travel';
      const meal = block === 'morning' ? 'breakfast cafe' : block === 'afternoon' ? 'local lunch spot' : block === 'evening' ? 'dinner recommendation' : 'optional night walk';
      items.push({
        dayNumber: day,
        timeBlock: block,
        title: `${city} ${block} ${theme}`,
        description: `Explore a ${theme}-focused ${block} plan with a ${meal}.`,
        locationName: `${city} central area`,
        category: block === 'night' ? 'optional' : 'activity',
        estimatedCost: 25 + day * 8 + index * 10,
        sortOrder: index,
        metadata: { meal, generatedBy: 'mock-ready-ai' },
      });
    });
  }

  return { title: `${tripName(trip)} AI Itinerary`, items };
}

export function generateDestinationRecommendations(filters = {}) {
  const budget = Number(filters.budget || 0);
  return destinationSeeds
    .filter((item) => !budget || item.estimatedBudget <= budget * 1.25)
    .map((item) => ({ ...item, metadata: { matchedInterests: filters.interests || [], season: filters.season || item.bestTimeToVisit } }));
}

export function generatePackingList(trip) {
  const destination = tripName(trip);
  return [
    ['Documents', 'Passport / ID copies'],
    ['Documents', 'Visa and insurance'],
    ['Clothing', `Weather-ready outfits for ${destination}`],
    ['Medicines', 'Prescription medicines and basic first aid'],
    ['Electronics', 'Chargers, adapter, power bank'],
    ['Money', 'Cards and small local cash'],
    ['Travel Essentials', 'Reusable bottle and day bag'],
  ].map(([category, title], index) => ({ category, title, sortOrder: index }));
}

export function generateSmartSuggestions({ trip, budgetSummary, weather }) {
  const suggestions = [
    { icon: '💡', priority: 'Medium', title: 'Optimize daily route', description: `Group nearby attractions in ${tripName(trip)} to reduce transit time and taxi costs.` },
    { icon: '🍽️', priority: 'Low', title: 'Try local restaurants', description: 'Mix popular restaurants with local markets to save money and experience regional food.' },
    { icon: '🛡️', priority: 'High', title: 'Safety reminder', description: 'Keep emergency contacts, hotel address, and document copies accessible offline.' },
  ];

  if (budgetSummary?.utilization >= 80) suggestions.unshift({ icon: '💸', priority: 'High', title: 'Budget limit approaching', description: 'Prioritize pre-booked essentials and reduce shopping or premium transport.' });
  if (weather?.rainChance > 50) suggestions.unshift({ icon: '🌧️', priority: 'Medium', title: 'Rain plan needed', description: 'Keep indoor attractions and flexible transport options ready.' });
  return suggestions.slice(0, 6);
}
