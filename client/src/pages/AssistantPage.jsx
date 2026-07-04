import { MessageCircle, Sparkles } from 'lucide-react';

function AssistantPage() {
  return (
    <section className="page-stack">
      <section className="app-card text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-orange-50 text-orange-500 shadow-xl shadow-orange-100">
          <MessageCircle className="h-10 w-10" />
        </div>
        <p className="section-eyebrow mt-6">AI Assistant</p>
        <h1 className="section-title">Travel assistant coming soon</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
          AI feature will be added in a future milestone.
        </p>
      </section>

      <section className="app-card">
        <p className="section-eyebrow">AI smart suggestions</p>
        <h2 className="section-title">Helpful ideas for your trip</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {['Itinerary ideas', 'Budget optimization', 'Packing checklist'].map((title) => (
            <article key={title} className="rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <h3 className="mt-4 font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">AI feature will be added in a future milestone.</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default AssistantPage;
