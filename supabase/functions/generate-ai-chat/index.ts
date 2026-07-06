import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const defaultModel = 'gemini-1.5-flash';

type ChatBody = {
  message?: string;
  trip?: Record<string, unknown> | null;
  history?: Array<{ role?: string; content?: string }>;
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

async function getAuthenticatedUser(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const authHeader = req.headers.get('Authorization') || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase function environment is not configured.');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { user: null };
  return { user: data.user };
}

function tripLabel(trip: Record<string, unknown> = {}) {
  const customDestination = typeof trip.customDestination === 'object' && trip.customDestination !== null
    ? trip.customDestination as Record<string, unknown>
    : {};
  return (
    safeString(trip.title) ||
    safeString(trip.city) ||
    safeString(customDestination.name) ||
    'the traveler trip'
  );
}

function buildPrompt(body: ChatBody) {
  const trip = body.trip || {};
  const history = (body.history || [])
    .slice(-8)
    .map((item) => `${safeString(item.role, 'user')}: ${safeString(item.content).slice(0, 500)}`)
    .join('\n');

  return `You are TripSafar's travel assistant. Give practical, safe, concise travel help.

Trip context:
- Trip: ${tripLabel(trip)}
- City: ${safeString(trip.city) || 'not set'}
- Country: ${safeString(trip.country) || 'not set'}
- Dates: ${safeString(trip.startDate) || 'flexible'} to ${safeString(trip.endDate) || 'flexible'}
- Travelers: ${String(trip.travelerCount || 'not set')}
- Budget: ${String(trip.budget || 'flexible')}
- Style: ${safeString(trip.travelStyle) || 'balanced'}
- Interests: ${Array.isArray(trip.interests) ? trip.interests.join(', ') : 'not set'}

Recent chat:
${history || 'No previous messages.'}

Traveler asks:
${safeString(body.message)}

Answer in 3-6 short paragraphs or bullets. If information is missing, ask one focused follow-up question. Do not invent booking confirmations, prices, or visa rules as facts.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ message: 'Method not allowed.' }, 405);

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const model = Deno.env.get('GEMINI_MODEL') || defaultModel;
    if (!apiKey) return jsonResponse({ message: 'AI chat is not configured yet.' }, 503);

    const { user } = await getAuthenticatedUser(req);
    if (!user) return jsonResponse({ message: 'You must be logged in to use AI chat.' }, 401);

    const body = (await req.json()) as ChatBody;
    if (!safeString(body.message)) return jsonResponse({ message: 'Message is required.' }, 400);

    const prompt = buildPrompt(body);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, topP: 0.85, maxOutputTokens: 1200 },
      }),
    });

    if (!response.ok) {
      const providerError = await response.text();
      return jsonResponse({ message: `Gemini request failed with status ${response.status}: ${providerError.slice(0, 500)}` }, 502);
    }

    const providerPayload = await response.json();
    const content = safeString(providerPayload?.candidates?.[0]?.content?.parts?.[0]?.text);
    if (!content) return jsonResponse({ message: 'AI returned an empty response.' }, 502);

    return jsonResponse({
      role: 'assistant',
      content,
      model,
      metadata: {
        generatedBy: model,
        usage: providerPayload?.usageMetadata || null,
      },
    });
  } catch (error) {
    console.error('generate-ai-chat error', error);
    return jsonResponse({ message: error instanceof Error ? error.message : 'Unable to generate AI chat.' }, 500);
  }
});
