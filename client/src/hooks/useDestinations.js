import { useCallback, useEffect, useState } from 'react';
import * as destinationService from '../services/destinationService.js';

export function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    destinationService
      .listDestinations()
      .then((data) => {
        if (!isMounted) return;
        setDestinations(data.destinations);
        setPagination(data.pagination);
        setError('');
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(apiError?.response?.data?.message || 'Unable to load destinations.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshDestinations = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await destinationService.listDestinations(params);
      setDestinations(data.destinations);
      setPagination(data.pagination);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to load destinations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { destinations, pagination, isLoading, error, refreshDestinations };
}
