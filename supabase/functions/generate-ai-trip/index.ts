import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const timeBlocks = ['morning', 'afternoon', 'evening', 'night'];
const maxDays = 14;
const defaultModel = 'gemini-1.5-flash';

type TripPayload = {
  id?: string;
  _id?: string;
  title?: string;
  city?: string;
  country?: string;
  customDestination?: { name?: string; country?: string };
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  travelerCount?: number;
  travelStyle?: string;
  interests?: string[];
  notes?: string;
  budget?: number;
};

type GenerateBody = {
  trip?: TripPayload;
  draft?: Record<string, unknown>;
  weather?: Record<string, unknown> | null;
  days?: number;
  action?: string;
  preferences?: { interests?: string[] };
};

type GeneratedItem = {
  dayNumber: number;
  timeBlock: string;
  title: string;
  description: string;
  locationName: string;
  category: string;
  estimatedCost: number;
  sortOrder: number;
  metadata: Record<string, unknown>;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getDurationFromDates(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

function clampDays(value: unknown, trip?: TripPayload) {
  const requestedDays = value || trip?.durationDays || getDurationFromDates(trip?.startDate, trip?.endDate) || 3;
  const days = Math.round(safeNumber(requestedDays, 3));
  return Math.min(Math.max(days || 3, 1), maxDays);
}

function getTripId(trip?: TripPayload) {
  return safeString(trip?.id || trip?._id) || null;
}

function destinationLabel(trip?: TripPayload, draft: Record<string, unknown> = {}) {
  return (
    safeString(draft.destination) ||
    safeString(trip?.city) ||
    safeString(trip?.customDestination?.name) ||
    safeString(trip?.title) ||
    'the destination'
  );
}

function extractJson(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] || text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response was not valid JSON.');
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeStringArray(value: unknown, maxItems = 8) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => safeString(item)).filter(Boolean).slice(0, maxItems);
}

function normalizeItem(item: Record<string, unknown>, index: number, days: number, model: string): GeneratedItem {
  const dayNumber = Math.min(Math.max(Math.round(safeNumber(item.dayNumber, Math.floor(index / 4) + 1)), 1), days);
  const timeBlock = timeBlocks.includes(safeString(item.timeBlock)) ? safeString(item.timeBlock) : timeBlocks[index % timeBlocks.length];

  return {
    dayNumber,
    timeBlock,
    title: safeString(item.title, 'AI travel stop'),
    description: safeString(item.description, 'Personalized activity for this part of the trip.'),
    locationName: safeString(item.locationName),
    category: safeString(item.category, 'activity'),
    estimatedCost: Math.max(0, safeNumber(item.estimatedCost, 0)),
    sortOrder: Math.max(0, Math.round(safeNumber(item.sortOrder, index % timeBlocks.length))),
    metadata: {
      generatedBy: model,
      ...(typeof item.metadata === 'object' && item.metadata !== null ? item.metadata : {}),
    },
  };
}

function normalizeAiPayload(payload: Record<string, unknown>, body: GenerateBody, model: string) {
  const days = clampDays(body.days, body.trip);
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, index) => normalizeItem(item, index, days, model))
    .filter((item) => item.title);

  if (!items.length) {
    throw new Error('AI did not return itinerary items.');
  }

  return {
    title: safeString(payload.title, `${destinationLabel(body.trip, body.draft)} AI Itinerary`),
    summary: safeString(payload.summary),
    estimatedBudget: safeString(payload.estimatedBudget),
    tips: normalizeStringArray(payload.tips),
    packingChecklist: normalizeStringArray(payload.packingChecklist, 12),
    budgetNotes: normalizeStringArray(payload.budgetNotes),
    items,
    usage: typeof payload.usage === 'object' && payload.usage !== null ? payload.usage : null,
  };
}

function getActionInstruction(action = '') {
  const instructions: Record<string, string> = {
    'reduce-budget': 'Improve the itinerary by making the full plan clearly cheaper than the existing version. Reduce estimatedCost values where realistic, replace premium/paid activities with free or low-cost alternatives, prefer public transport/walking routes, choose budget-friendly local food, avoid luxury shopping and paid add-ons, and include budget-saving notes in descriptions. The returned itinerary must visibly show lower-cost choices.',
    'hidden-gems': 'Improve the itinerary by adding lesser-known local places, quiet viewpoints, neighborhood cafes, cultural corners, and authentic non-touristy stops.',
    'family-friendly': 'Improve the itinerary for families. Use a safer pace, shorter travel hops, rest breaks, kid-friendly attractions, accessible food options, and clear safety notes.',
    'food-recommendations': 'Improve the itinerary by adding specific food recommendations, local dishes, markets, cafes, and meal stops around the daily route.',
    'adventure-activities': 'Improve the itinerary by adding adventure activities such as hikes, water sports, scenic routes, outdoor experiences, and active local excursions while keeping safety in mind.',
  };

  return instructions[action] || 'Create the best balanced itinerary for the trip.';
}

function buildPrompt(body: GenerateBody) {
  const trip = body.trip || {};
  const draft = body.draft || {};
  const days = clampDays(body.days || trip.durationDays);
  const interests = body.preferences?.interests?.length ? body.preferences.interests : trip.interests || [];

  return `You are TravelAI Planner. Create a practical, safe, personalized ${days}-day travel itinerary.

Trip context:
- Destination: ${destinationLabel(trip, draft)}
- Country: ${safeString(trip.country) || safeString(trip.customDestination?.country) || 'not specified'}
- Dates: ${safeString(trip.startDate) || 'flexible'} to ${safeString(trip.endDate) || 'flexible'}
- Travelers: ${safeNumber(trip.travelerCount || draft.travelers, 1)}
- Budget: ${safeNumber(trip.budget || draft.budget, 0) || 'flexible'}
- Travel style: ${safeString(trip.travelStyle || draft.travelStyle) || 'balanced'}
- Interests: ${interests.join(', ') || 'local highlights'}
- Notes: ${safeString(trip.notes || draft.notes) || 'none'}
- Weather context: ${body.weather ? JSON.stringify(body.weather).slice(0, 1200) : 'not available'}
- Existing itinerary to improve: ${draft.existingItineraryItems ? JSON.stringify(draft.existingItineraryItems).slice(0, 2500) : 'not available'}

AI action requested:
${getActionInstruction(body.action)}

Return ONLY valid JSON. Do not include markdown.
Schema:
{
  "title": "string",
  "summary": "string",
  "estimatedBudget": "string",
  "tips": ["string"],
  "packingChecklist": ["string"],
  "budgetNotes": ["string"],
  "items": [
    {
      "dayNumber": 1,
      "timeBlock": "morning|afternoon|evening|night",
      "title": "string",
      "description": "string",
      "locationName": "string",
      "category": "activity|food|transport|rest|culture|nature|shopping|safety",
      "estimatedCost": 0,
      "sortOrder": 0,
      "metadata": { "reason": "string" }
    }
  ]
}

Create 3-4 items for every day from Day 1 through Day ${days}; do not stop early at 3 days when the trip is longer. Keep descriptions specific and realistic. Include budget-conscious choices and safety notes when useful.`;
}

async function getAuthenticatedUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization') || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase function environment is not configured.');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : client;
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    return { client, adminClient, user: null };
  }

  return { client, adminClient, user: data.user };
}

function utcDayStartIso() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

async function hasReachedDailyLimit(client: ReturnType<typeof createClient>, userId: string, limit: number) {
  if (!limit || limit < 1) return false;

  const { count, error } = await client
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('request_type', 'itinerary_generation')
    .gte('created_at', utcDayStartIso());

  if (error) {
    console.warn('Unable to check AI daily limit', error.message);
    return false;
  }

  return (count || 0) >= limit;
}

async function logUsage(
  client: ReturnType<typeof createClient>,
  params: {
    userId: string;
    tripId: string | null;
    prompt: string;
    responseSummary?: string;
    status: 'success' | 'failed';
    error?: string;
    latencyMs: number;
    tokenEstimate?: number;
  }
) {
  await client.from('ai_usage_logs').insert({
    user_id: params.userId,
    trip_id: params.tripId,
    request_type: 'itinerary_generation',
    prompt: params.prompt.slice(0, 2000),
    response_summary: (params.responseSummary || '').slice(0, 500),
    token_estimate: params.tokenEstimate || Math.ceil(params.prompt.length / 4),
    status: params.status,
    latency_ms: params.latencyMs,
    error: (params.error || '').slice(0, 500),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ message: 'Method not allowed.' }, 405);
  }

  const startedAt = Date.now();
  let prompt = '';
  let tripId: string | null = null;

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const model = Deno.env.get('GEMINI_MODEL') || defaultModel;
    const dailyLimit = Number(Deno.env.get('AI_DAILY_LIMIT') || 0);

    if (!apiKey) {
      return jsonResponse({ message: 'AI generation is not configured yet.' }, 503);
    }

    const { adminClient, user } = await getAuthenticatedUser(req);
    if (!user) {
      return jsonResponse({ message: 'You must be logged in to generate an AI trip.' }, 401);
    }

    if (await hasReachedDailyLimit(adminClient, user.id, dailyLimit)) {
      return jsonResponse({ message: 'Daily AI generation limit reached. Please try again tomorrow.' }, 429);
    }

    const body = (await req.json()) as GenerateBody;
    tripId = getTripId(body.trip);
    prompt = buildPrompt(body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: body.action ? 0.45 : 0.7,
          topP: 0.85,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const providerError = await response.text();
      const errorSummary = `Gemini request failed with status ${response.status}: ${providerError.slice(0, 500)}`;
      console.error('Gemini provider error', errorSummary);
      await logUsage(adminClient, {
        userId: user.id,
        tripId,
        prompt,
        status: 'failed',
        error: errorSummary,
        latencyMs: Date.now() - startedAt,
      });
      return jsonResponse({ message: errorSummary }, 502);
    }

    const providerPayload = await response.json();
    const text = providerPayload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('AI returned an empty response.');
    }

    const parsed = extractJson(text);
    const generated = normalizeAiPayload(parsed, body, model);
    const usage = providerPayload?.usageMetadata || generated.usage;

    await logUsage(adminClient, {
      userId: user.id,
      tripId,
      prompt,
      responseSummary: generated.summary || generated.title,
      status: 'success',
      latencyMs: Date.now() - startedAt,
      tokenEstimate: usage?.totalTokenCount,
    });

    return jsonResponse({ ...generated, usage: usage || generated.usage });
  } catch (error) {
    console.error('generate-ai-trip error', error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      return jsonResponse({ message: 'AI action took too long. Please try again with a smaller itinerary.' }, 504);
    }
    return jsonResponse({ message: error instanceof Error ? error.message : 'Unable to generate AI trip.' }, 500);
  }
});
