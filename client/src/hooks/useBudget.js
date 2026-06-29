import { useCallback, useState } from 'react';
import * as budgetService from '../services/budgetService.js';

export function useBudget() {
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBudget = useCallback(async (tripId) => {
    if (!tripId) return null;

    setIsLoading(true);
    setError('');

    try {
      const data = await budgetService.getBudget(tripId);
      setBudget(data.budget);
      return data.budget;
    } catch (apiError) {
      if (apiError?.response?.status === 404) {
        setBudget(null);
        return null;
      }

      setError(apiError?.response?.data?.message || 'Unable to load budget.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBudget = useCallback(async (tripId, payload) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await budgetService.updateBudget(tripId, payload);
      setBudget(data.budget);
      return data.budget;
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to save budget.');
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (budgetId) => {
    setIsLoading(true);
    setError('');

    try {
      await budgetService.deleteBudget(budgetId);
      setBudget(null);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to delete budget.');
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { budget, isLoading, error, loadBudget, saveBudget, deleteBudget };
}
