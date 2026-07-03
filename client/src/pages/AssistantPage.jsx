import { useMemo, useState } from 'react';
import AssistantChat from '../features/travelAssistant/components/AssistantChat.jsx';
import SmartSuggestionCard from '../features/travelAssistant/components/SmartSuggestionCard.jsx';
import { useTravelAssistant } from '../hooks/useTravelAssistant.js';
import { useTrips } from '../hooks/useTrips.js';
import { generateSmartSuggestions } from '../services/aiTravelService.js';

function AssistantPage() {
  const { trips } = useTrips();
  const { sessions, activeSession, messages, isLoading, isSending, error, setActiveSession, startSession, sendMessage } = useTravelAssistant();
  const [activeTripId, setActiveTripId] = useState('');
  const activeTrip = trips.find((trip) => trip._id === activeTripId);
  const suggestions = useMemo(() => generateSmartSuggestions({ trip: activeTrip }), [activeTrip]);

  async function handleNewChat() {
    const session = await startSession({ trip: activeTrip, title: activeTrip ? `${activeTrip.title} assistant` : 'Travel chat' });
    setActiveSession(session);
  }

  return (
    <section className="page-stack">
      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {isLoading && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Loading assistant...</p>}
      <AssistantChat
        trips={trips}
        activeTripId={activeTripId}
        onTripChange={(event) => setActiveTripId(event.target.value)}
        sessions={sessions}
        activeSession={activeSession}
        onSessionChange={setActiveSession}
        messages={messages}
        onNewChat={handleNewChat}
        onSend={(text) => sendMessage({ text, trip: activeTrip })}
        isSending={isSending}
      />
      <section className="app-card">
        <p className="section-eyebrow">AI smart suggestions</p>
        <h2 className="section-title">Helpful ideas for your trip</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {suggestions.map((suggestion) => <SmartSuggestionCard key={suggestion.title} suggestion={suggestion} />)}
        </div>
      </section>
    </section>
  );
}

export default AssistantPage;
