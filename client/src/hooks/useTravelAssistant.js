import { useCallback, useEffect, useRef, useState } from 'react';
import { sendTravelMessage } from '../services/aiTravelService.js';
import * as tripManagementService from '../services/tripManagementService.js';

function getErrorMessage(apiError, fallback) {
  return apiError?.response?.data?.message || apiError?.message || fallback;
}

export function useTravelAssistant() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const didLoadSessions = useRef(false);
  const lastLoadedSessionId = useRef('');

  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await tripManagementService.listChatSessions();
      setSessions(data.sessions);
      setActiveSession((current) => current || data.sessions[0] || null);
      return data.sessions;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load assistant chats.'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didLoadSessions.current) return;
    didLoadSessions.current = true;
    refreshSessions();
  }, [refreshSessions]);

  const loadMessages = useCallback(async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return [];
    }
    try {
      const data = await tripManagementService.listChatMessages(sessionId);
      setMessages(data.messages);
      return data.messages;
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to load chat history.'));
      return [];
    }
  }, []);

  useEffect(() => {
    const sessionId = activeSession?._id || '';
    if (lastLoadedSessionId.current === sessionId) return;
    lastLoadedSessionId.current = sessionId;
    loadMessages(sessionId);
  }, [activeSession, loadMessages]);

  const startSession = useCallback(async ({ trip, title = 'Travel chat' } = {}) => {
    setError('');
    const data = await tripManagementService.createChatSession({
      title,
      tripId: trip?._id,
      context: { tripTitle: trip?.title, destination: trip?.city || trip?.customDestination?.name },
    });
    setSessions((current) => [data.session, ...current]);
    setActiveSession(data.session);
    setMessages([]);
    return data.session;
  }, []);

  const sendMessage = useCallback(
    async ({ text, trip }) => {
      if (!text.trim()) return null;
      setIsSending(true);
      setError('');
      try {
        const session = activeSession || (await startSession({ trip, title: text.slice(0, 42) }));
        const userData = await tripManagementService.createChatMessage({ sessionId: session._id, role: 'user', content: text });
        setMessages((current) => [...current, userData.message]);
        const assistant = await sendTravelMessage({ message: text, trip, history: messages });
        const assistantData = await tripManagementService.createChatMessage({ sessionId: session._id, ...assistant });
        setMessages((current) => [...current, assistantData.message]);
        await refreshSessions();
        return assistantData.message;
      } catch (apiError) {
        setError(getErrorMessage(apiError, 'Unable to send message.'));
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [activeSession, messages, refreshSessions, startSession]
  );

  return { sessions, activeSession, messages, isLoading, isSending, error, setActiveSession, refreshSessions, loadMessages, startSession, sendMessage };
}
