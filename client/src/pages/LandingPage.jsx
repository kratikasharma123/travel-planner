import { Link } from 'react-router-dom';

const services = [
  {
    icon: '🌤️',
    title: 'Weather-aware planning',
    description: 'Plan routes, activities, and packing with weather context built into every trip.',
  },
  {
    icon: '🧭',
    title: 'Best destinations',
    description: 'Discover destinations by budget, season, interests, and travel style.',
  },
  {
    icon: '🤖',
    title: 'AI travel assistant',
    description: 'Ask for itineraries, food ideas, safety tips, packing lists, and budget advice.',
  },
  {
    icon: '💳',
    title: 'Budget control',
    description: 'Track planned and actual expenses with clear travel finance insights.',
  },
];

const destinations = [
  {
    city: 'Santorini',
    country: 'Greece',
    price: '$1.4k',
    days: '7 Days Trip',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85',
    alt: 'White Santorini buildings with blue sea view',
  },
  {
    city: 'Kyoto',
    country: 'Japan',
    price: '$1.8k',
    days: '10 Days Trip',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85',
    alt: 'Kyoto temple and traditional Japanese architecture',
  },
  {
    city: 'Goa',
    country: 'India',
    price: '$650',
    days: '5 Days Trip',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85',
    alt: 'Goa beach coastline with palm trees',
  },
];

const steps = [
  {
    icon: '📍',
    title: 'Choose destination',
    description: 'Pick a city, date range, interests, and travel budget.',
  },
  {
    icon: '🗓️',
    title: 'Build itinerary',
    description: 'Generate smart daily plans, bookings, checklists, and local ideas.',
  },
  {
    icon: '💼',
    title: 'Travel with confidence',
    description: 'Save plans, track expenses, and ask the assistant for help anytime.',
  },
];

const testimonials = [
  {
    quote: 'TravelAI made our family trip easier to plan, budget, and organize in one place.',
    name: 'Riya Sharma',
    role: 'Family traveler',
  },
  {
    quote: 'The AI assistant feels like a personal trip expert available before and during travel.',
    name: 'Arjun Mehta',
    role: 'Solo explorer',
  },
];

const partners = ['SkyWays', 'TripNest', 'GlobeGo', 'StayEasy', 'Roamly'];

function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-lg">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-200/70 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary-100 blur-3xl" />
      <div className="relative rounded-[2rem] bg-white p-4 shadow-2xl shadow-orange-200/50">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-100 via-amber-50 to-primary-50 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-600 shadow-sm">
              AI Trip Preview
            </span>
            <span className="text-3xl">✈️</span>
          </div>
          <div className="mt-8 overflow-hidden rounded-[1.5rem]">
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=85"
              alt="Airplane wing flying above the clouds for a travel journey"
              className="h-80 w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="absolute -left-6 top-24 rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Next stop</p>
        <p className="mt-1 font-bold text-slate-950">Rome, Italy</p>
        <p className="text-sm text-slate-500">Best food tour at 6 PM</p>
      </div>

      <div className="absolute -right-6 bottom-16 rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Budget saved</p>
        <p className="mt-1 text-2xl font-extrabold text-primary-600">22%</p>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-orange-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="relative">
      <section className="app-container grid min-h-[calc(100vh-76px)] gap-12 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-16">
        <div className="animate-soft-fade-up">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-orange-500">
            Best AI powered travel planner
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Travel, enjoy and plan a smarter trip.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Build personalized itineraries, manage budgets, save bookings, discover destinations,
            and ask your AI travel assistant for help at every step.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-200 transition hover:bg-orange-600"
            >
              Find out more
            </Link>
          </div>
        </div>
        <div className="animate-soft-float">
          <HeroVisual />
        </div>
      </section>

      <section id="services" className="app-container py-16">
        <SectionHeading
          eyebrow="Category"
          title="We offer best services"
          description="Everything you need to move from travel idea to confident itinerary."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={`landing-hover-card rounded-[2rem] bg-white p-6 text-center shadow-soft ${index === 2 ? 'ring-2 ring-orange-100' : ''}`}
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-orange-50 text-3xl">
                {service.icon}
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-slate-950">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="destinations" className="app-container py-16">
        <SectionHeading
          eyebrow="Top selling"
          title="Top destinations"
          description="Start with popular routes and customize every detail with AI."
        />
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {destinations.map((destination) => (
            <article
              key={destination.city}
              className="landing-hover-card overflow-hidden rounded-[2rem] bg-white shadow-soft"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.alt}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-4 text-lg font-bold text-slate-800">
                  <h3>
                    {destination.city}, {destination.country}
                  </h3>
                  <span>{destination.price}</span>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <span>➤</span> {destination.days}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="booking"
        className="app-container grid gap-12 py-16 lg:grid-cols-[0.9fr_1fr] lg:items-center"
      >
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-orange-500">
            Easy and fast
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Book your next trip in 3 easy steps
          </h2>
          <div className="mt-8 grid gap-5">
            {steps.map((step) => (
              <div key={step.title} className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-xl">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-soft-float relative mx-auto w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl shadow-primary-100">
          <div className="h-48 overflow-hidden rounded-[1.5rem]">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85"
              alt="Traveler enjoying a scenic destination while planning a trip"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <h3 className="mt-5 text-xl font-extrabold text-slate-950">Trip to Europe</h3>
          <p className="mt-2 text-sm text-slate-500">14-29 June • by TravelAI</p>
          <div className="mt-5 flex gap-3 text-lg">
            <span>🌿</span>
            <span>🗺️</span>
            <span>📍</span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-600">24 people going</p>
          <div className="absolute -right-8 bottom-12 rounded-2xl bg-white p-4 shadow-soft">
            <p className="text-xs font-bold text-slate-400">Ongoing</p>
            <p className="mt-1 font-extrabold text-slate-950">Trip to Rome</p>
            <p className="mt-2 text-sm font-bold text-primary-600">40% completed</p>
            <div className="mt-2 h-2 w-32 rounded-full bg-slate-100">
              <div className="h-2 w-2/5 rounded-full bg-primary-500" />
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="app-container py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-orange-500">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              What travelers say about us.
            </h2>
          </div>
          <div className="grid gap-5">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.name}
                className="landing-hover-card rounded-[2rem] bg-white p-6 shadow-soft"
              >
                <p className="text-base leading-8 text-slate-600">“{testimonial.quote}”</p>
                <footer className="mt-5">
                  <p className="font-extrabold text-slate-950">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="app-container py-10">
        <div className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-soft sm:grid-cols-5">
          {partners.map((partner) => (
            <div
              key={partner}
              className="grid place-items-center rounded-2xl bg-slate-50 px-4 py-5 text-lg font-extrabold text-slate-400"
            >
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="app-container py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary-50 p-8 text-center sm:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[28px] border-white/60" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border-[28px] border-white/60" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold leading-tight text-slate-800 sm:text-4xl">
              Subscribe to get travel ideas, budget tips, and AI planning updates.
            </h2>
            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                className="form-control flex-1 bg-white"
                placeholder="Your email"
              />
              <button
                type="submit"
                className="rounded-2xl bg-orange-500 px-7 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-orange-100 bg-white/70">
        <div className="app-container grid gap-10 py-14 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1.1fr]">
          <div>
            <h2 className="text-4xl font-black text-slate-950">TravelAI</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Book your trip in minute, get full control for much longer with AI-powered planning.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-950">Company</h3>
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

          <div>
            <h3 className="text-lg font-extrabold text-slate-950">Contact</h3>
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

          <div>
            <h3 className="text-lg font-extrabold text-slate-950">More</h3>
            <div className="mt-5 grid gap-3 text-sm font-medium text-slate-500">
              <Link to="/destinations" className="hover:text-orange-500">
                Airline fees
              </Link>
              <Link to="/planner" className="hover:text-orange-500">
                Airline
              </Link>
              <Link to="/assistant" className="hover:text-orange-500">
                Low fare tips
              </Link>
            </div>
          </div>

          <div>
            <div className="flex gap-3">
              {['f', '𝕏', '◎'].map((item) => (
                <a
                  key={item}
                  href="#top"
                  aria-label={`Social ${item}`}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg font-extrabold text-slate-700 shadow-soft transition hover:-translate-y-1 hover:text-orange-500"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="pb-8 text-center text-sm font-medium text-slate-500">
          All rights reserved @travelai.co
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
