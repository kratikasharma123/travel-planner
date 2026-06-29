import { useCallback, useEffect, useState } from 'react';
import * as savedTripService from '../services/savedTripService.js';

export function useSavedTrips() {
  const [savedTrips, setSavedTrips] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    savedTripService
      .listSavedTrips()
      .then((data) => {
        if (!isMounted) return;
        setSavedTrips(data.savedTrips);
        setPagination(data.pagination);
        setError('');
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(apiError?.response?.data?.message || 'Unable to load saved trips.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshSavedTrips = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await savedTripService.listSavedTrips(params);
      setSavedTrips(data.savedTrips);
      setPagination(data.pagination);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to load saved trips.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTrip = useCallback(
    async (payload) => {
      const data = await savedTripService.saveTrip(payload);
      await refreshSavedTrips();
      return data.savedTrip;
    },
    [refreshSavedTrips]
  );

  const updateSavedTrip = useCallback(
    async (savedTripId, payload) => {
      const data = await savedTripService.updateSavedTrip(savedTripId, payload);
      await refreshSavedTrips();
      return data.savedTrip;
    },
    [refreshSavedTrips]
  );

  const removeSavedTrip = useCallback(
    async (savedTripId) => {
      await savedTripService.removeSavedTrip(savedTripId);
      await refreshSavedTrips();
    },
    [refreshSavedTrips]
  );

  return {
    savedTrips,
    pagination,
    isLoading,
    error,
    refreshSavedTrips,
    saveTrip,
    updateSavedTrip,
    removeSavedTrip,
  };
}
