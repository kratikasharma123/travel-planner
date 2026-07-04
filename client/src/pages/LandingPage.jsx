import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPromptModal from '../components/AuthPromptModal.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

const services = [
  {
    icon: '🛰️',
    title: 'AI route architect',
    description: 'Turn one dream city into a route with smart stops, travel times, and backup plans.',
  },
  {
    icon: '🌦️',
    title: 'Weather mood scanner',
    description: 'Match activities with forecast, crowd levels, season, and the vibe you want.',
  },
  {
    icon: '🪙',
    title: 'Budget autopilot',
    description: 'Split flights, stays, food, and experiences so your trip looks exciting and realistic.',
  },
  {
    icon: '🗝️',
    title: 'Hidden local gems',
    description: 'Find cafes, photo spots, cultural walks, and safety tips beyond normal tourist lists.',
  },
];

const destinations = [
  {
    city: 'Reykjavik',
    country: 'Iceland',
    price: '$1.9k',
    days: '6 Nights',
    tag: 'Aurora chase',
    image:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=900&q=90',
    alt: 'Northern lights glowing above Iceland mountains',
  },
  {
    city: 'Ubud',
    country: 'Bali',
    price: '$820',
    days: '8 Nights',
    tag: 'Slow escape',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=90',
    alt: 'Green rice terraces in Bali',
  },
  {
    city: 'Marrakech',
    country: 'Morocco',
    price: '$970',
    days: '5 Nights',
    tag: 'Culture trail',
    image:
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=90',
    alt: 'Colorful Moroccan market street in Marrakech',
  },
  {
    city: 'Santorini',
    country: 'Greece',
    price: '$1.4k',
    days: '6 Nights',
    tag: 'Island glow',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=90',
    alt: 'White Santorini buildings with blue sea view',
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    price: '$1.8k',
    days: '7 Nights',
    tag: 'Zen route',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=90',
    alt: 'Kyoto temple and traditional Japanese architecture',
  },
  {
    city: 'Dubai',
    country: 'UAE',
    price: '$1.1k',
    days: '4 Nights',
    tag: 'Luxury stop',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=90',
    alt: 'Dubai skyline with modern buildings',
  },
  {
    city: 'Paris',
    country: 'France',
    price: '$1.6k',
    days: '5 Nights',
    tag: 'Romance plan',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=90',
    alt: 'Eiffel Tower in Paris city view',
  },
  {
    city: 'Goa',
    country: 'India',
    price: '$650',
    days: '4 Nights',
    tag: 'Beach break',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=90',
    alt: 'Goa beach coastline with palm trees',
  },
];

const steps = [
  {
    icon: '01',
    title: 'Tell us your travel mood',
    description: 'Choose beach, adventure, food, calm, culture, party, or a custom mix.',
  },
  {
    icon: '02',
    title: 'Watch the map build itself',
    description: 'TripSafar creates day-wise plans with routes, costs, weather, and local tips.',
  },
  {
    icon: '03',
    title: 'Save, ask, and adjust anytime',
    description: 'Change dates, budget, hotel style, pace, and group needs with one AI chat.',
  },
];

const testimonials = [
  {
    quote: 'It did not feel like a template itinerary. TripSafar planned our days around food, rain, and rest.',
    name: 'Riya Sharma',
    role: 'Family traveler',
  },
  {
    quote: 'The budget view helped me pick better stays and still keep money for the experiences I wanted.',
    name: 'Arjun Mehta',
    role: 'Solo explorer',
  },
];

const partners = ['Air paths', 'Boutique stays', 'Food trails', 'Local guides', 'Smart maps'];

const moodTags = ['Food-first', 'Romantic', 'Backpacking', 'Luxury', 'Adventure'];

const promoPosters = [
  {
    title: 'Beach escape',
    subtitle: 'Summer routes',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=90',
  },
  {
    title: 'Mountain mood',
    subtitle: 'Fresh air trips',
    image:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=700&q=90',
  },
  {
    title: 'City lights',
    subtitle: 'Weekend plans',
    image:
      'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=700&q=90',
  },
  {
    title: 'Road stories',
    subtitle: 'Long drive ideas',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&q=90',
  },
  {
    title: 'Culture trail',
    subtitle: 'Local gems',
    image:
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=700&q=90',
  },
  {
    title: 'Dream holiday',
    subtitle: 'Smart offers',
    image:
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=700&q=90',
  },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-xl" aria-label="AI generated travel route preview">
      <div className="absolute -left-8 top-10 h-52 w-52 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -right-10 bottom-8 h-64 w-64 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="absolute left-1/3 top-1/3 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-orange-200/40">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <div className="relative h-96 overflow-hidden bg-gradient-to-br from-orange-100 via-sky-100 to-white">
            <img
              src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1000&q=90"
              alt="Travel promotion poster with world landmarks and vacation mood"
              className="absolute inset-0 h-full w-full object-cover opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/65 via-orange-500/20 to-white/10" />
            <div className="absolute left-7 top-7 rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600 shadow-lg">
              Holiday offer
            </div>
            <div className="absolute bottom-7 left-7 right-7 text-white">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">TripSafar special</p>
              <h3 className="mt-2 text-4xl font-black leading-none tracking-tight drop-shadow-lg">
                Explore more.
                <br />
                Spend less.
              </h3>
              <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3 text-slate-950 shadow-xl backdrop-blur">
                <span className="text-2xl font-black text-orange-500">35%</span>
                <span className="text-xs font-black uppercase leading-4 tracking-wide">
                  off smart
                  <br />
                  trip plans
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center" data-reveal="up">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-500">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
    </div>
  );
}

function PromoPosterRail() {
  const posters = [...promoPosters, ...promoPosters];

  return (
    <section className="py-12" aria-label="Travel poster offers">
      <div className="app-container mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div data-reveal="left">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-500">Explore posters</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Trending travel moods
          </h2>
        </div>
      </div>

      <div className="landing-poster-mask overflow-hidden">
        <div className="landing-poster-track flex w-max gap-5 px-4">
          {posters.map((poster, index) => (
            <article key={`${poster.title}-${index}`} className="w-56 shrink-0 text-center sm:w-64">
              <div className="relative h-56 w-56 overflow-hidden rounded-full shadow-xl shadow-orange-100 sm:h-64 sm:w-64">
                <img src={poster.image} alt={poster.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                {poster.subtitle}
              </p>
              <h3 className="mt-1 text-xl font-black text-slate-950">{poster.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const [authPrompt, setAuthPrompt] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const activeTestimonial = testimonials[testimonialIndex];
  const nextTestimonial = testimonials[(testimonialIndex + 1) % testimonials.length];

  function openAuthPrompt(mode, redirectTo, destination = null) {
    setAuthPrompt({ mode, redirectTo, destination });
  }

  function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const savedEmails = JSON.parse(window.localStorage.getItem('tripsafar-newsletter-emails') || '[]');

    if (savedEmails.includes(email)) {
      setNewsletterStatus({ type: 'info', message: 'You are already subscribed for TripSafar offers.' });
      return;
    }

    window.localStorage.setItem('tripsafar-newsletter-emails', JSON.stringify([...savedEmails, email]));
    setNewsletterEmail('');
    setNewsletterStatus({ type: 'success', message: 'Subscribed! Your 5% smart trip offer is ready.' });
  }

  function handleTestimonialShift(direction) {
    setTestimonialIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  return (
    <ScrollReveal className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_30%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute left-0 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-72 h-[32rem] w-[32rem] translate-x-1/3 rounded-full bg-cyan-200/30 blur-3xl" />

      <section className="landing-hero-section relative min-h-[calc(100vh-76px)] overflow-hidden">
        <div className="app-container relative grid gap-12 py-12 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-16">
          <div className="animate-soft-fade-up" data-reveal="left">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Meet TripSafar AI
            </div>
            <h1 className="landing-hero-title mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Your trip should feel like a story, not a spreadsheet.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
              TripSafar AI designs personal travel routes with budget, weather, local gems, and smart
              planning tools in one beautiful planning space.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => openAuthPrompt('register', '/my-trips')}
                className="rounded-full bg-slate-950 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-300 transition hover:-translate-y-1 hover:bg-orange-500"
              >
                Start my trip
              </button>
              <button
                type="button"
                onClick={() => openAuthPrompt('login', '/planner')}
                className="rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:text-orange-600"
              >
                Plan with AI
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {moodTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white bg-white/70 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm backdrop-blur"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="animate-soft-float" data-reveal="right">
            <HeroVisual />
          </div>
        </div>
      </section>

      <PromoPosterRail />

      <section id="services" className="app-container relative py-16">
        <SectionHeading
          eyebrow="Why it feels different"
          title="Plans that react like a real travel expert"
          description="Not another basic booking page. TripSafar shapes every trip around your style, time, budget, and the conditions on the ground."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <article
              key={service.title}
              data-reveal={index % 2 === 0 ? 'left' : 'right'}
              data-reveal-delay={index * 0.05}
              className="landing-hover-card group relative overflow-hidden rounded-[2.2rem] bg-white p-6 shadow-xl shadow-orange-100/70 ring-1 ring-orange-50"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-300 via-amber-300 to-orange-500" />
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-100/80 transition duration-300 group-hover:scale-125" />
              <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-amber-50" />

              <div className="relative flex items-center justify-between gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-3xl shadow-sm ring-1 ring-orange-100 transition group-hover:rotate-6 group-hover:bg-orange-500">
                  <span className="transition group-hover:scale-110">{service.icon}</span>
                </div>
                <span className="text-4xl font-black text-orange-100">0{index + 1}</span>
              </div>

              <h3 className="relative mt-7 text-lg font-black leading-tight text-slate-950">{service.title}</h3>
              <p className="relative mt-3 text-sm leading-6 text-slate-600">{service.description}</p>

              <div className="relative mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                <span className="h-px flex-1 bg-orange-100" />
                TripSafar
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="destinations" className="app-container py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div data-reveal="left">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-500">Dream boards</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Pick your next picture-perfect route
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Image-first cards for popular travel moods. Pick one and remix the plan with AI.
            </p>
          </div>
          <div className="hidden rounded-[2rem] bg-orange-50 p-5 text-sm font-bold text-orange-600 lg:block" data-reveal="right">
            ✨ Choose a vibe • AI edits budget • Weather-aware route
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => (
            <article
              key={destination.city}
              data-reveal={index % 2 === 0 ? 'left' : 'right'}
              data-reveal-delay={index * 0.08}
              className="landing-hover-card group overflow-hidden rounded-[1.8rem] bg-white shadow-xl shadow-orange-100/60"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.alt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {destination.city}, {destination.country}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{destination.tag}</p>
                  </div>
                  <span className="text-base font-black text-slate-700">{destination.price}</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <span className="text-orange-500">➤</span>
                    {destination.days}
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuthPrompt('register', '/my-trips', destination)}
                    className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-orange-600 transition hover:bg-orange-500 hover:text-white"
                  >
                    View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="booking"
        className="app-container grid gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
      >
        <div data-reveal="left">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-500">Easy and fast</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Build a trip in 3 creative steps
          </h2>
          <div className="mt-8 grid gap-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                data-reveal={index % 2 === 0 ? 'left' : 'right'}
                data-reveal-delay={index * 0.06}
                className="group flex gap-4 rounded-[1.7rem] border border-transparent p-3 transition hover:border-orange-100 hover:bg-white hover:shadow-soft"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-500 text-sm font-black text-white shadow-lg shadow-orange-200 transition group-hover:rotate-6">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-black text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          data-reveal="right"
          className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl shadow-primary-100"
        >
          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=90"
                alt="Traveler enjoying a scenic destination while planning a trip"
                className="h-full min-h-80 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Trip cockpit</p>
              <h3 className="mt-3 text-xl font-black text-slate-950">Italy food moon</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">7 days • 3 cities • relaxed pace • under $1.2k</p>
              <div className="mt-5 grid gap-3">
                {['Rome street pasta', 'Florence art walk', 'Venice sunrise boat'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-600">✓</span>
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">AI note</p>
                <p className="mt-2 text-sm leading-6">Move Venice one day later to avoid rain and save $74.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="app-container py-16">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div data-reveal="left">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-500">Testimonials</p>
            <h2 className="mt-3 max-w-md text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              What people say about us.
            </h2>
            <div className="mt-8 flex items-center gap-4">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  onClick={() => setTestimonialIndex(index)}
                  className={`h-3 w-3 rounded-full transition ${
                    testimonialIndex === index ? 'bg-slate-950' : 'bg-slate-300 hover:bg-orange-300'
                  }`}
                  aria-label={`Show testimonial from ${testimonial.name}`}
                />
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl" data-reveal="right">
            <div className="absolute -right-3 top-12 hidden h-64 w-[88%] rounded-[2rem] border-2 border-slate-100 bg-white/70 md:block" />
            <blockquote className="relative rounded-[2rem] bg-white p-7 shadow-2xl shadow-orange-100/70 sm:p-8">
              <div className="absolute -left-5 -top-5 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-orange-100 shadow-xl shadow-orange-100 ring-4 ring-white">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=90"
                  alt="Traveler reviewer"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-slate-600 sm:mt-2">
                “{activeTestimonial.quote}”
              </p>
              <footer className="mt-7">
                <p className="text-lg font-black text-slate-800">{activeTestimonial.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{activeTestimonial.role}</p>
              </footer>
            </blockquote>

            <blockquote className="relative ml-auto mt-7 w-[88%] rounded-[2rem] border-2 border-slate-100 bg-white/85 p-6 shadow-soft">
              <p className="text-base font-semibold leading-7 text-slate-600">“{nextTestimonial.quote}”</p>
              <footer className="mt-5">
                <p className="font-black text-slate-800">{nextTestimonial.name}</p>
                <p className="text-sm font-semibold text-slate-500">{nextTestimonial.role}</p>
              </footer>
            </blockquote>

            <div className="absolute -right-10 top-1/2 hidden -translate-y-1/2 grid-cols-1 gap-5 text-3xl font-black text-slate-300 lg:grid">
              <button
                type="button"
                onClick={() => handleTestimonialShift(-1)}
                className="transition hover:text-orange-500"
                aria-label="Previous testimonial"
              >
                ⌃
              </button>
              <button
                type="button"
                onClick={() => handleTestimonialShift(1)}
                className="transition hover:text-orange-500"
                aria-label="Next testimonial"
              >
                ⌄
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="app-container py-10">
        <div className="grid gap-4 rounded-[2rem] border border-white bg-white/75 p-5 shadow-soft backdrop-blur sm:grid-cols-5">
          {partners.map((partner, index) => (
            <div
              key={partner}
              data-reveal={index % 2 === 0 ? 'left' : 'right'}
              data-reveal-delay={index * 0.04}
              className="grid place-items-center rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-slate-400"
            >
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="app-container py-16">
        <div
          data-reveal="up"
          className="relative overflow-hidden rounded-[2.7rem] bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-2xl shadow-orange-100/70 ring-1 ring-orange-100 sm:p-8 lg:p-10"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-200/60 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-100/80 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Limited travel deal
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Subscribe and get 5% off on your first smart trip plan.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Join TripSafar to receive promo codes, hidden route ideas, budget hacks, and weekly destination offers.
              </p>
              <form
                className="mt-8 flex max-w-xl flex-col gap-3 rounded-[1.7rem] bg-white p-2 shadow-xl shadow-orange-100 sm:flex-row"
                onSubmit={handleNewsletterSubmit}
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  className="min-h-12 flex-1 rounded-[1.3rem] border-0 bg-transparent px-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Enter your email address"
                />
                <button
                  type="submit"
                  className="rounded-[1.3rem] bg-orange-500 px-7 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Subscribe
                </button>
              </form>
              {newsletterStatus && (
                <p
                  className={`mt-3 max-w-xl rounded-2xl px-4 py-3 text-sm font-bold ${
                    newsletterStatus.type === 'error'
                      ? 'bg-rose-50 text-rose-700'
                      : newsletterStatus.type === 'info'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {newsletterStatus.message}
                </p>
              )}
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-5 top-8 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-orange-100">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Saved</p>
                <p className="mt-1 text-xl font-black text-orange-500">42 routes</p>
              </div>
              <div className="overflow-hidden rounded-[2.3rem] bg-white p-3 shadow-2xl shadow-orange-100">
                <img
                  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=90"
                  alt="Traveler planning scenic travel route"
                  className="h-72 w-full rounded-[1.8rem] object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">This week</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">Hidden weekend escapes</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Handpicked short trips, local food stops, and weather-safe plans.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {authPrompt && (
        <AuthPromptModal
          mode={authPrompt.mode}
          redirectTo={authPrompt.redirectTo}
          destination={authPrompt.destination}
          onClose={() => setAuthPrompt(null)}
        />
      )}

      <footer className="border-t border-orange-100 bg-white/80 backdrop-blur">
        <div className="app-container grid gap-10 py-14 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1.1fr]">
          <div data-reveal="left">
            <h2 className="text-3xl font-black text-slate-950">TripSafar</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              AI travel planning that turns budgets, dreams, and details into trips with personality.
            </p>
          </div>

          <div data-reveal="up" data-reveal-delay="0.05">
            <h3 className="text-base font-black text-slate-950">Company</h3>
            <div className="mt-5 grid gap-3 text-sm font-medium text-slate-500">
              <a href="#services" className="hover:text-orange-500">
                About
              </a>
              <a href="#booking" className="hover:text-orange-500">
                Careers
              </a>
              <a href="#destinations" className="hover:text-orange-500">
                Mobile
              </a>
            </div>
          </div>

          <div data-reveal="up" data-reveal-delay="0.1">
            <h3 className="text-base font-black text-slate-950">Contact</h3>
            <div className="mt-5 grid gap-3 text-sm font-medium text-slate-500">
              <Link to="/login" className="hover:text-orange-500">
                Help/FAQ
              </Link>
              <Link to="/register" className="hover:text-orange-500">
                Press
              </Link>
              <a href="#reviews" className="hover:text-orange-500">
                Affiliates
              </a>
            </div>
          </div>

          <div data-reveal="up" data-reveal-delay="0.15">
            <h3 className="text-base font-black text-slate-950">Explore</h3>
            <div className="mt-5 grid gap-3 text-sm font-medium text-slate-500">
              <button
                type="button"
                onClick={() => openAuthPrompt('login', '/destinations')}
                className="text-left hover:text-orange-500"
              >
                Destinations
              </button>
              <button
                type="button"
                onClick={() => openAuthPrompt('register', '/my-trips')}
                className="text-left hover:text-orange-500"
              >
                Planner
              </button>
              <button
                type="button"
                onClick={() => openAuthPrompt('login', '/planner')}
                className="text-left hover:text-orange-500"
              >
                AI planner
              </button>
            </div>
          </div>

          <div data-reveal="right" data-reveal-delay="0.2">
            <div className="flex gap-3">
              {['f', '𝕏', '◎'].map((item) => (
                <a
                  key={item}
                  href="#top"
                  aria-label={`Social ${item}`}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-black text-slate-700 shadow-soft transition hover:-translate-y-1 hover:text-orange-500"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="pb-8 text-center text-sm font-medium text-slate-500">
          All rights reserved @tripsafar.com
        </p>
      </footer>
    </ScrollReveal>
  );
}

export default LandingPage;
