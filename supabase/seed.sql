-- TravelAI Planner dummy destination data
-- Run this after supabase/schema.sql in the Supabase SQL editor.

insert into public.destinations (
  name,
  country,
  region,
  description,
  best_time_to_visit,
  cost_level,
  tags,
  popular_attractions,
  safety_notes,
  family_suitability_notes,
  image_url,
  status
)
values
  (
    'Goa',
    'India',
    'West India',
    'A beach destination known for nightlife, seafood, Portuguese heritage, and relaxed coastal stays.',
    'November to February',
    'mid-range',
    array['beach', 'nightlife', 'food', 'friends'],
    array['Baga Beach', 'Fort Aguada', 'Dudhsagar Falls', 'Old Goa Churches'],
    'Use registered taxis or trusted ride services at night. Keep valuables safe at crowded beaches.',
    'North Goa is lively; South Goa is calmer and better for families.',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    'active'
  ),
  (
    'Jaipur',
    'India',
    'Rajasthan',
    'The Pink City offers forts, palaces, colorful markets, traditional food, and rich culture.',
    'October to March',
    'budget',
    array['history', 'culture', 'food', 'shopping'],
    array['Amber Fort', 'Hawa Mahal', 'City Palace', 'Johri Bazaar'],
    'Book licensed guides and confirm prices before local shopping or tuk-tuk rides.',
    'Great for families because attractions are close and cultural activities are easy to plan.',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    'active'
  ),
  (
    'Manali',
    'India',
    'Himachal Pradesh',
    'A mountain getaway with snow views, adventure sports, cafes, and scenic valleys.',
    'March to June or December to February for snow',
    'mid-range',
    array['mountains', 'adventure', 'nature', 'snow'],
    array['Solang Valley', 'Hadimba Temple', 'Atal Tunnel', 'Old Manali'],
    'Check weather and road conditions during winter. Avoid risky adventure vendors.',
    'Family friendly, but plan travel time carefully because mountain roads can be tiring.',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    'active'
  ),
  (
    'Dubai',
    'United Arab Emirates',
    'Middle East',
    'A modern city with luxury shopping, desert safaris, beaches, skyscrapers, and family attractions.',
    'November to March',
    'luxury',
    array['luxury', 'shopping', 'family', 'desert'],
    array['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah'],
    'Respect local laws and dress codes in public places. Use official taxis or metro.',
    'Very family friendly with theme parks, malls, beaches, and clean public transport.',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    'active'
  ),
  (
    'Bali',
    'Indonesia',
    'Southeast Asia',
    'A tropical island with beaches, temples, rice terraces, wellness retreats, and surfing.',
    'April to October',
    'mid-range',
    array['beach', 'wellness', 'nature', 'honeymoon'],
    array['Ubud', 'Tanah Lot Temple', 'Uluwatu', 'Tegallalang Rice Terrace'],
    'Use helmets on scooters and be careful with ocean currents at beaches.',
    'Good for families, especially resorts in Nusa Dua and calm beach areas.',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    'active'
  ),
  (
    'Singapore',
    'Singapore',
    'Southeast Asia',
    'A clean, safe city with gardens, theme parks, food courts, shopping, and excellent transit.',
    'February to April',
    'luxury',
    array['family', 'food', 'city', 'shopping'],
    array['Gardens by the Bay', 'Sentosa', 'Marina Bay Sands', 'Universal Studios Singapore'],
    'Follow strict public rules around littering, chewing gum, and public behavior.',
    'Excellent for families because transport is easy and attractions are well managed.',
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    'active'
  )
on conflict do nothing;
