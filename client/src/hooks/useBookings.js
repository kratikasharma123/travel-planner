import { useCallback, useEffect, useState } from 'react';
import * as bookingService from '../services/bookingService.js';

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refreshBookings = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await bookingService.listBookings(params);
      setBookings(data.bookings);
      setPagination(data.pagination);
      return data.bookings;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load bookings.'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    bookingService
      .listBookings()
      .then((data) => {
        if (!isMounted) return;
        setBookings(data.bookings);
        setPagination(data.pagination);
        setError('');
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(getErrorMessage(apiError, 'Unable to load bookings.'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const createBooking = useCallback(async (payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await bookingService.createBooking(payload);
      await refreshBookings();
      return data.booking;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to create booking.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshBookings]);

  const updateBooking = useCallback(async (bookingId, payload) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await bookingService.updateBooking(bookingId, payload);
      await refreshBookings();
      return data.booking;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to update booking.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshBookings]);

  const cancelBooking = useCallback(async (bookingId) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = await bookingService.cancelBooking(bookingId);
      await refreshBookings();
      return data.booking;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to cancel booking.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshBookings]);

  const deleteBooking = useCallback(async (bookingId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await bookingService.deleteBooking(bookingId);
      await refreshBookings();
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to delete booking.'));
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshBookings]);

  return {
    bookings,
    pagination,
    isLoading,
    isSubmitting,
    error,
    refreshBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
  };
}
