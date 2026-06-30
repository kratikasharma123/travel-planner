import { useState } from 'react';
import EmptyState from './EmptyState.jsx';

const prompts = ['Plan a 3-day itinerary', 'Estimate trip costs', 'Packing suggestions', 'Best local foods', 'Safety tips', 'Hotel ideas'];

function AssistantChat({ trips = [], activeTripId, onTripChange, messages = [], sessions = [], activeSession, onSessionChange, onSend, onNewChat, isSending }) {
  const [text, setText] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    await onSend(text);
    setText('');
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="app-card grid gap-4 content-start">
        <button type="button" onClick={onNewChat} className="btn-primary">New chat</button>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Trip context
          <select value={activeTripId || ''} onChange={onTripChange} className="form-control">
            <option value="">General travel</option>
            {trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title}</option>)}
          </select>
        </label>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">History</p>
          <div className="mt-3 grid gap-2">
            {sessions.length === 0 && <p className="text-sm text-slate-500">No chats yet.</p>}
            {sessions.map((session) => (
              <button key={session._id} type="button" onClick={() => onSessionChange(session)} className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold ${activeSession?._id === session._id ? 'bg-primary-50 text-primary-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                {session.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="app-card grid min-h-[620px] grid-rows-[auto_1fr_auto] gap-4">
        <div>
          <p className="section-eyebrow">AI Travel Assistant</p>
          <h1 className="section-title">Ask anything about your trip</h1>
          <p className="section-description">Get destination ideas, itineraries, restaurants, packing help, budgets, transport options, and safety advice.</p>
        </div>

        <div className="overflow-y-auto rounded-2xl bg-slate-50 p-4">
          {messages.length === 0 ? (
            <EmptyState title="Start a travel conversation" description="Use a suggested prompt or ask your own question." />
          ) : (
            <div className="grid gap-3">
              {messages.map((message) => (
                <div key={message._id || message.content} className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-primary-500 text-white' : 'bg-white text-slate-700'}`}>
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setText(prompt)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">{prompt}</button>)}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input value={text} onChange={(event) => setText(event.target.value)} className="form-control flex-1" placeholder="Ask for hotels, food, itinerary, budget, packing..." />
            <button type="submit" disabled={isSending} className="btn-primary">{isSending ? 'Sending...' : 'Send'}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AssistantChat;
