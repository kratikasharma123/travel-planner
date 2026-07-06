import { listDestinations } from './destinationService.js';
import { supabase } from './supabaseClient.js';
import { createServiceError } from './supabaseUtils.js';

const timeBlocks = ['morning', 'afternoon', 'evening', 'night'];

function tripName(trip) {
  return trip?.title || trip?.customDestination?.name || trip?.city || 'your trip';
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

async function getFunctionErrorMessage(error) {
  try {
    const payload = await error?.context?.json?.();
    return payload?.message || payload?.error || error?.message;
  } catch {
    return error?.message;
  }
}

export async function sendTravelMessage({ message, trip, history = [] }) {
  const { data, error } = await supabase.functions.invoke('generate-ai-chat', {
    body: {
      message,
      trip,
      history: history.slice(-12).map((item) => ({ role: item.role, content: item.content })),
    },
  });

  if (error) {
    const errorMessage = await getFunctionErrorMessage(error);
    throw createServiceError(
      { message: errorMessage || 'AI chat is not configured yet.', code: error.code, status: error.status },
      'AI chat is not configured yet.'
    );
  }

  if (!data?.content) {
    throw createServiceError(
      { message: 'AI chat returned an empty response.', code: 'EMPTY_AI_CHAT' },
      'AI chat returned an empty response.'
    );
  }

  return {
    role: 'assistant',
    content: data.content,
    metadata: data.metadata || { generatedBy: data.model || 'ai' },
  };
}

function getDurationFromDates(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  return Math.round((end - start) / 86400000) + 1;
}

function safeGeneratedDays(days, trip = {}) {
  const requestedDays = days || trip.durationDays || getDurationFromDates(trip.startDate, trip.endDate) || 3;
  const numberValue = Number(requestedDays);
  if (!Number.isFinite(numberValue)) return 3;
  return Math.min(Math.max(Math.round(numberValue), 1), 14);
}

function normalizeGeneratedItem(item = {}, index = 0) {
  return {
    dayNumber: Number(item.dayNumber || 1),
    timeBlock: timeBlocks.includes(item.timeBlock) ? item.timeBlock : timeBlocks[index % timeBlocks.length],
    title: item.title || 'AI travel stop',
    description: item.description || '',
    locationName: item.locationName || '',
    category: item.category || 'activity',
    estimatedCost: Number(item.estimatedCost || 0),
    sortOrder: Number(item.sortOrder ?? index % timeBlocks.length),
    metadata: item.metadata || { generatedBy: 'gemini' },
  };
}

export async function generateItinerary({ trip, days = 3, interests = [], draft = {}, weather = null, action = '' }) {
  const safeDays = safeGeneratedDays(days, trip);
  const { data, error } = await supabase.functions.invoke('generate-ai-trip', {
    body: {
      trip,
      draft,
      weather,
      days: safeDays,
      action,
      preferences: { interests: normalizeStringArray(interests) },
    },
  });

  if (error) {
    const message = await getFunctionErrorMessage(error);
    throw createServiceError({ message: message || 'Unable to generate AI itinerary.', code: error.code, status: error.status }, 'Unable to generate AI itinerary.');
  }

  if (!data?.items?.length) {
    throw createServiceError({ message: data?.message || 'AI did not return itinerary items.', code: 'EMPTY_AI_ITINERARY' }, 'AI did not return itinerary items.');
  }

  return {
    title: data.title || `${tripName(trip)} AI Itinerary`,
    summary: data.summary || '',
    estimatedBudget: data.estimatedBudget || '',
    tips: normalizeStringArray(data.tips),
    packingChecklist: normalizeStringArray(data.packingChecklist),
    budgetNotes: normalizeStringArray(data.budgetNotes),
    usage: data.usage || null,
    items: data.items.map(normalizeGeneratedItem),
  };
}

function destinationToRecommendation(destination = {}, filters = {}) {
  const estimatedBudget = Number(destination.costLevel === 'luxury' ? 2200 : destination.costLevel === 'budget' ? 700 : 1300);
  return {
    destinationName: destination.name,
    country: destination.country || '',
    city: destination.region || destination.name,
    estimatedBudget,
    bestTimeToVisit: destination.bestTimeToVisit || '',
    rating: Number(destination.rating || 4.7),
    imageUrl: destination.imageUrl || '',
    popularAttractions: destination.popularAttractions || [],
    travelTips: [destination.safetyNotes, destination.familySuitabilityNotes].filter(Boolean).slice(0, 3),
    metadata: {
      matchedInterests: filters.interests || [],
      season: filters.season || destination.bestTimeToVisit || '',
      source: 'destinations',
    },
  };
}

export async function generateDestinationRecommendations(filters = {}) {
  const budget = Number(filters.budget || 0);
  const { destinations } = await listDestinations({ limit: 100 });
  return destinations
    .map((destination) => destinationToRecommendation(destination, filters))
    .filter((item) => !budget || item.estimatedBudget <= budget * 1.25)
    .slice(0, 6);
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
