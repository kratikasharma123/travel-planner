import { useCallback, useEffect, useState } from 'react';
import * as budgetService from '../services/budgetService.js';

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

export function useBudget() {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refreshBudgets = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await budgetService.listBudgets(filters);
      setBudgets(data.budgets);
      setSelectedBudget((current) => {
        if (!current) return data.budgets[0] || null;
        return data.budgets.find((budget) => budget._id === current._id) || data.budgets[0] || null;
      });
      return data.budgets;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load budgets.'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshExpenses = useCallback(async (filters = {}) => {
    if (!filters.budgetId) {
      setExpenses([]);
      setPagination(null);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await budgetService.listExpenses(filters);
      setExpenses(data.expenses);
      setPagination(data.pagination);
      return data.expenses;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load expenses.'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    budgetService
      .listBudgets()
      .then((data) => {
        if (!isMounted) return;
        setBudgets(data.budgets);
        setSelectedBudget(data.budgets[0] || null);
        setError('');
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(getErrorMessage(apiError, 'Unable to load budgets.'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectBudget = useCallback((budgetId) => {
    if (!budgetId) {
      setSelectedBudget(null);
      setExpenses([]);
      setPagination(null);
      return;
    }

    setSelectedBudget((current) => budgets.find((budget) => budget._id === budgetId) || current || null);
  }, [budgets]);

  const createBudget = useCallback(async (payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await budgetService.createBudget(payload);
      setBudgets((current) => [data.budget, ...current]);
      setSelectedBudget(data.budget);
      return data.budget;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to create budget.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateBudget = useCallback(async (budgetId, payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await budgetService.updateBudgetRecord(budgetId, payload);
      setBudgets((current) => current.map((budget) => (budget._id === budgetId ? data.budget : budget)));
      setSelectedBudget(data.budget);
      return data.budget;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to update budget.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const removeBudget = useCallback(async (budgetId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await budgetService.deleteBudget(budgetId);
      setBudgets((current) => {
        const remaining = current.filter((budget) => budget._id !== budgetId);
        setSelectedBudget(remaining[0] || null);
        return remaining;
      });
      setExpenses([]);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to delete budget.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createExpense = useCallback(async (payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await budgetService.createExpense(payload);
      setExpenses((current) => [data.expense, ...current]);
      return data.expense;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to create expense.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateExpense = useCallback(async (expenseId, payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await budgetService.updateExpense(expenseId, payload);
      setExpenses((current) => current.map((expense) => (expense._id === expenseId ? data.expense : expense)));
      return data.expense;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to update expense.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteExpense = useCallback(async (expenseId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await budgetService.deleteExpense(expenseId);
      setExpenses((current) => current.filter((expense) => expense._id !== expenseId));
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to delete expense.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const loadBudget = useCallback(async (tripId) => {
    if (!tripId) return null;

    setIsLoading(true);
    setError('');

    try {
      const data = await budgetService.getBudget(tripId);
      setSelectedBudget(data.budget);
      return data.budget;
    } catch (apiError) {
      if (apiError?.response?.status === 404) {
        setSelectedBudget(null);
        return null;
      }
      setError(getErrorMessage(apiError, 'Unable to load budget.'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBudget = useCallback(async (tripId, payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await budgetService.updateBudget(tripId, payload);
      setSelectedBudget(data.budget);
      await refreshBudgets();
      return data.budget;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to save budget.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshBudgets]);

  return {
    budget: selectedBudget,
    budgets,
    selectedBudget,
    expenses,
    pagination,
    isLoading,
    isSubmitting,
    error,
    refreshBudgets,
    selectBudget,
    createBudget,
    updateBudget,
    deleteBudget: removeBudget,
    refreshExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    loadBudget,
    saveBudget,
  };
}
