import { useCallback, useEffect, useState } from 'react';
import * as tripService from '../services/tripService.js';

export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    tripService
      .listTrips()
      .then((data) => {
        if (!isMounted) return;
        setTrips(data.trips);
        setPagination(data.pagination);
        setError('');
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(apiError?.response?.data?.message || 'Unable to load trips.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshTrips = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await tripService.listTrips(params);
      setTrips(data.trips);
      setPagination(data.pagination);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to load trips.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTrip = useCallback(
    async (payload) => {
      const data = await tripService.createTrip(payload);
      await refreshTrips();
      return data.trip;
    },
    [refreshTrips]
  );

  const updateTrip = useCallback(
    async (tripId, payload) => {
      const data = await tripService.updateTrip(tripId, payload);
      await refreshTrips();
      return data.trip;
    },
    [refreshTrips]
  );

  const archiveTrip = useCallback(
    async (tripId) => {
      const data = await tripService.archiveTrip(tripId);
      await refreshTrips();
      return data.trip;
    },
    [refreshTrips]
  );

  return { trips, pagination, isLoading, error, refreshTrips, createTrip, updateTrip, archiveTrip };
}
