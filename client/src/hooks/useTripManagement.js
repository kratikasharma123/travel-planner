import { useCallback, useState } from 'react';
import { generateItinerary, generatePackingList } from '../services/aiTravelService.js';
import * as tripManagementService from '../services/tripManagementService.js';

function unwrap(data) {
  return data.records || data.items || data.itineraries || [];
}

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

export function useTripManagement() {
  const [itineraries, setItineraries] = useState([]);
  const [itineraryItems, setItineraryItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [locations, setLocations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshTripManagement = useCallback(async (tripId) => {
    if (!tripId) return;
    setIsLoading(true);
    setError('');
    try {
      const [itineraryData, bookingData, checklistData, documentData, notificationData, locationData] = await Promise.all([
        tripManagementService.listItineraries(tripId),
        tripManagementService.bookingsCrud.list(tripId),
        tripManagementService.checklistsCrud.list(tripId),
        tripManagementService.documentsCrud.list(tripId),
        tripManagementService.notificationsCrud.list(tripId),
        tripManagementService.locationsCrud.list(tripId),
      ]);
      setItineraries(itineraryData.itineraries);
      setBookings(unwrap(bookingData));
      setChecklists(unwrap(checklistData));
      setDocuments(unwrap(documentData));
      setNotifications(unwrap(notificationData));
      setLocations(unwrap(locationData));
      if (itineraryData.itineraries[0]) {
        const items = await tripManagementService.listItineraryItems(itineraryData.itineraries[0]._id);
        setItineraryItems(items.items);
      } else {
        setItineraryItems([]);
      }
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load trip management data.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGeneratedItinerary = useCallback(async (trip, options = {}) => {
    if (!trip?._id) return null;
    setIsLoading(true);
    setError('');
    try {
      const generated = await generateItinerary({
        trip,
        days: trip?.durationDays || 3,
        interests: options.interests || trip?.interests || [],
        draft: options.draft || {},
        weather: options.weather || null,
      });
      const data = await tripManagementService.createItinerary({ tripId: trip._id, title: generated.title, source: 'ai', status: 'saved' });
      const itemData = await tripManagementService.createItineraryItems(data.itinerary, generated.items);
      setItineraries((current) => [data.itinerary, ...current]);
      setItineraryItems(itemData.items);
      return { itinerary: data.itinerary, items: itemData.items, generated };
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to generate AI itinerary.'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const seedPackingChecklist = useCallback(async (trip) => {
    const items = generatePackingList(trip);
    const created = [];
    for (const item of items) {
      const data = await tripManagementService.checklistsCrud.create({ ...item, tripId: trip._id });
      created.push(data.record);
    }
    setChecklists((current) => [...created, ...current]);
    return created;
  }, []);

  return {
    itineraries,
    itineraryItems,
    bookings,
    checklists,
    documents,
    notifications,
    locations,
    recommendations,
    isLoading,
    error,
    refreshTripManagement,
    createGeneratedItinerary,
    seedPackingChecklist,
    setItineraryItems,
    setRecommendations,
    bookingsCrud: tripManagementService.bookingsCrud,
    checklistsCrud: tripManagementService.checklistsCrud,
    documentsCrud: tripManagementService.documentsCrud,
    notificationsCrud: tripManagementService.notificationsCrud,
    locationsCrud: tripManagementService.locationsCrud,
  };
}
