import { useCallback, useEffect, useMemo, useState } from 'react';
import * as adminService from '../services/adminService.js';
import { buildAdminMetrics } from '../utils/adminAnalytics.js';

const initialData = {
  users: [],
  trips: [],
  bookings: [],
  aiLogs: [],
  tickets: [],
  reviews: [],
  notifications: [],
  auditLogs: [],
  contentItems: [],
  settings: [],
};

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

export function useAdmin() {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');

  const refreshAdmin = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const next = await adminService.getAdminDashboardData();
      setData(next);
      return next;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load admin data.'));
      return initialData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    adminService
      .getAdminDashboardData()
      .then((next) => {
        if (isMounted) setData(next);
      })
      .catch((apiError) => {
        if (isMounted) setError(getErrorMessage(apiError, 'Unable to load admin data.'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const mutate = useCallback(
    async (operation) => {
      setIsMutating(true);
      setError('');
      try {
        const result = await operation();
        await refreshAdmin();
        return result;
      } catch (apiError) {
        const message = getErrorMessage(apiError, 'Admin action failed.');
        setError(message);
        throw apiError;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshAdmin]
  );

  const updateUser = useCallback(
    (userId, payload) =>
      mutate(() => adminService.updateUserProfile(userId, payload).then((result) => result.user)),
    [mutate]
  );
  const setUserStatus = useCallback(
    (userId, status, reason) =>
      mutate(() =>
        adminService.setUserStatus(userId, status, reason).then((result) => result.user)
      ),
    [mutate]
  );
  const createRecord = useCallback(
    (table, payload) =>
      mutate(() => adminService.createAdminRecord(table, payload).then((result) => result.record)),
    [mutate]
  );
  const updateRecord = useCallback(
    (table, id, payload) =>
      mutate(() =>
        adminService.updateAdminRecord(table, id, payload).then((result) => result.record)
      ),
    [mutate]
  );
  const deleteRecord = useCallback(
    (table, id) => mutate(() => adminService.deleteAdminRecord(table, id)),
    [mutate]
  );
  const saveSetting = useCallback(
    (payload) =>
      mutate(() => adminService.upsertAdminSetting(payload).then((result) => result.setting)),
    [mutate]
  );
  const replyToTicket = useCallback(
    (ticketId, message) =>
      mutate(() =>
        adminService.replyToSupportTicket(ticketId, message).then((result) => result.message)
      ),
    [mutate]
  );

  const metrics = useMemo(() => buildAdminMetrics(data), [data]);

  return {
    ...data,
    metrics,
    isLoading,
    isMutating,
    error,
    refreshAdmin,
    updateUser,
    setUserStatus,
    createRecord,
    updateRecord,
    deleteRecord,
    saveSetting,
    replyToTicket,
  };
}
