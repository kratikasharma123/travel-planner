import { useCallback, useEffect, useRef, useState } from 'react';
import * as savedPlaceService from '../services/savedPlaceService.js';

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

export function useSavedPlaces(initialParams = {}) {
  const initialParamsRef = useRef(initialParams);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refreshSavedPlaces = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await savedPlaceService.listSavedPlaces({ ...initialParamsRef.current, ...params });
      setSavedPlaces(data.savedPlaces);
      setPagination(data.pagination);
      return data.savedPlaces;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load saved places.'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    savedPlaceService
      .listSavedPlaces(initialParamsRef.current)
      .then((data) => {
        if (!isMounted) return;
        setSavedPlaces(data.savedPlaces);
        setPagination(data.pagination);
        setError('');
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(getErrorMessage(apiError, 'Unable to load saved places.'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const savePlace = useCallback(async (payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await savedPlaceService.savePlace(payload);
      await refreshSavedPlaces();
      return data.savedPlace;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to save place.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshSavedPlaces]);

  const removeSavedPlace = useCallback(async (savedPlaceId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await savedPlaceService.removeSavedPlace(savedPlaceId);
      await refreshSavedPlaces();
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to remove saved place.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshSavedPlaces]);

  const removeSavedPlaceByDestination = useCallback(async (destinationId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await savedPlaceService.removeSavedPlaceByDestination(destinationId);
      await refreshSavedPlaces();
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to remove saved place.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshSavedPlaces]);

  return {
    savedPlaces,
    pagination,
    isLoading,
    isSubmitting,
    error,
    refreshSavedPlaces,
    savePlace,
    removeSavedPlace,
    removeSavedPlaceByDestination,
  };
}
