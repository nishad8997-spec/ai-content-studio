// ============================================================================
// Supabase Edge Function: ai-generate
// Production Google Gemini Streaming Engine (gemini-3.5-flash-lite)
// Optimized for high-volume, low-cost SaaS AI copywriting output.
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// ----------------------------------------------------------------------------
// 1. CORS Headers
// ----------------------------------------------------------------------------
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// ----------------------------------------------------------------------------
// 2. Types & Centralized Tool Routing (All 5 Tools Powered by Gemini)
// ----------------------------------------------------------------------------
export type SupportedProvider = 'gemini';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ToolRoutingDefinition {
  provider: SupportedProvider;
  model: string;
  baseCredits: number;
  description: string;
}

export const TOOL_ROUTING: Record<string, ToolRoutingDefinition> = {
  'blog-writer': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 15,
    description: 'Long-form structured markdown content requiring strong multi-section coherence and SEO framing.'
  },
  'email-writer': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 10,
    description: 'Ultra-fast token streaming for high-converting sales outreach, client pitches, and newsletters.'
  },
  'instagram-caption': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 5,
    description: 'Short-form punchy text with emoji integration, mood matching, and strategic hashtags.'
  },
  'facebook-ads': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 8,
    description: 'Structured Meta ads copywriting with primary text, headlines, descriptions, and CTA framing.'
  },
  'product-description': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 10,
    description: 'E-commerce spec-to-benefit conversion copy optimized for Shopify and Amazon listings.'
  }
};

// ----------------------------------------------------------------------------
// 3. Tool Prompt Builders
// ----------------------------------------------------------------------------
export function buildToolPrompts(toolId: string, inputs: Record<string, any>): { systemPrompt: string; userPrompt: string } {
  switch (toolId) {
    case 'blog-writer': {
      const topic = inputs.topic?.trim() || 'Modern Content Strategy & Growth';
      const keywords = inputs.keywords?.trim() || 'content creation, strategy, growth';
      const tone = inputs.tone || 'Professional';

      const systemPrompt = `You are a world-class blog post copywriter and SEO content strategist.
Your task is to write a comprehensive, high-value, highly engaging blog article formatted in clean Markdown.
Tone of voice: ${tone}.
Structure requirements:
1. Catchy H1 Title.
2. Compelling introduction that hooks the reader and outlines the core challenge.
3. 3-4 deep, actionable H2 sections with practical frameworks, bullet points, and numbered steps.
4. Seamless inclusion of target keywords without keyword stuffing.
5. Memorable blockquote or pro-tip.
6. Clear, actionable conclusion with Key Takeaways.
Never output meta commentary or conversational preamble. Deliver only the finished markdown article.`;

      const userPrompt = `Please write a complete, in-depth blog post on the following topic:
Topic/Title: "${topic}"
Target Keywords: "${keywords}"
Tone: ${tone}`;

      return { systemPrompt, userPrompt };
    }

    case 'email-writer': {
      const recipient = inputs.recipient?.trim() || 'Growth & Marketing Leaders';
      const offer = inputs.offer?.trim() || 'Automate content workflows and save 15+ hours weekly';
      const callToAction = inputs.callToAction?.trim() || '15-minute quick discovery call next Tuesday';

      const systemPrompt = `You are an elite direct-response email copywriter specializing in B2B sales outreach and high-open-rate newsletters.
Your goal is to write a high-converting cold outreach email with high reply rates.
Format requirements:
1. 3 punchy, high-open-rate Subject Line variations (Direct, Value-Driven, Curiosity).
2. Clean horizontal divider.
3. Personalized opening hook.
4. Clear articulation of the recipient's pain point and the value proposition.
5. High-impact bullet points highlighting key benefits.
6. Low-friction, clear Call to Action (CTA).
7. Professional email sign-off with placeholder tags.
Never output meta commentary. Provide only the finished email draft and subject options.`;

      const userPrompt = `Please write a high-converting email based on these inputs:
Target Recipient: "${recipient}"
Core Offer / Value Prop: "${offer}"
Desired Call to Action: "${callToAction}"`;

      return { systemPrompt, userPrompt };
    }

    case 'instagram-caption': {
      const description = inputs.description?.trim() || 'Behind the scenes at our creative workspace';
      const mood = inputs.mood || 'Inspiring & Motivational';
      const hashtagOption = inputs.includeHashtags || '5-10 High Growth Hashtags';

      const systemPrompt = `You are a viral social media manager and Instagram copywriter.
Your goal is to craft engaging, scroll-stopping captions that drive comments, saves, and shares.
Format requirements:
1. Powerful 1-line hook with emoji that grabs immediate attention before the "more" cutoff.
2. Engaging body copy matching the requested mood (${mood}).
3. A clear engagement question or CTA encouraging comments.
4. Strategic, high-visibility hashtags (if requested).
Deliver only the finished social copy.`;

      const userPrompt = `Create an Instagram caption for:
Post Description: "${description}"
Mood/Vibe: "${mood}"
Hashtag Strategy: "${hashtagOption}"`;

      return { systemPrompt, userPrompt };
    }

    case 'facebook-ads': {
      const productName = inputs.productName?.trim() || 'AI Content Studio';
      const painPoint = inputs.painPoint?.trim() || 'Spending 20+ hours a week manually drafting content';
      const cta = inputs.cta || 'Sign Up Free';

      const systemPrompt = `You are a senior Meta Ads performance copywriter specializing in high-ROAS direct response campaigns.
Your goal is to write a complete ad copy package optimized for Facebook and Instagram Feeds.
Structure requirements:
1. **PRIMARY TEXT**: Emotional pain point hook, clear solution positioning, 3 benefit checkmarks, and a strong reason to act now.
2. **HEADLINE**: Punchy, benefit-driven headline under 40 characters.
3. **DESCRIPTION**: Short link description highlighting social proof, free trial, or key offer guarantee.
4. **CALL TO ACTION BUTTON**: Selected CTA: [ ${cta} ].
Deliver only the structured ad package.`;

      const userPrompt = `Write high-converting Meta ad copy for:
Product Name: "${productName}"
Customer Pain Point: "${painPoint}"
Selected CTA: "${cta}"`;

      return { systemPrompt, userPrompt };
    }

    case 'product-description': {
      const productName = inputs.productName?.trim() || 'Ergonomic Workspace Solution';
      const features = inputs.features?.trim() || 'Premium build, intuitive controls, all-day comfort';
      const targetAudience = inputs.targetAudience?.trim() || 'Remote professionals and creators';

      const systemPrompt = `You are a top-tier e-commerce copywriter specializing in high-converting Shopify, Amazon, and DTC product descriptions.
Your goal is to turn technical features into emotional benefits that drive purchases while optimizing for product SEO.
Structure requirements:
1. Engaging Product Title & Hero opening paragraph.
2. ✨ Key Features & Specifications formatted with bold benefit headers and descriptive bullets.
3. 👥 Target Audience Section ("Who Is This For?").
4. 🛒 "Why Choose [Product]" conversion close with guarantee / stock confidence note.
Deliver only the finished markdown product description.`;

      const userPrompt = `Write an e-commerce product description for:
Product Title: "${productName}"
Features & Specs: "${features}"
Target Customer: "${targetAudience}"`;

      return { systemPrompt, userPrompt };
    }

    default: {
      const systemPrompt = `You are an expert AI copywriting assistant for AI Content Studio. Produce high-quality, formatted markdown text tailored to the user's requirements.`;
      const userPrompt = JSON.stringify(inputs);
      return { systemPrompt, userPrompt };
    }
  }
}

// ----------------------------------------------------------------------------
// 4. Google Gemini Production Streaming Adapter (gemini-3.5-flash-lite)
// ----------------------------------------------------------------------------
async function streamGemini(
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  maxTokens = 2500
): Promise<ReadableStream<string>> {
  const targetModel = model || 'gemini-3.5-flash-lite';
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

  // Clean body compatible with modern Gemini models (no deprecated temperature/top_p)
  const body: Record<string, any> = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
    }
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsed = errorText;
    try {
      const json = JSON.parse(errorText);
      parsed = json?.error?.message || errorText;
    } catch (_) {}
    throw new Error(`Gemini API error (${response.status}): ${parsed}`);
  }

  if (!response.body) {
    throw new Error('Gemini returned an empty response stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  return new ReadableStream<string>({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            try {
              const json = JSON.parse(trimmed.substring(6));
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(text);
              }
            } catch (_) {}
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

// ----------------------------------------------------------------------------
// 5. Edge Function Handler
// ----------------------------------------------------------------------------
serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 2. Extract and Validate Supabase Authorization Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Please sign in to generate content.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Server environment is misconfigured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate User JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Please sign in to generate content.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parse Request Body & Lookup Centralized Server Routing
    const body = await req.json();
    const { toolId, inputs = {}, parameters = {} } = body;

    if (!toolId) {
      return new Response(
        JSON.stringify({ error: 'Please complete the required fields and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const routing = TOOL_ROUTING[toolId] || {
      provider: 'gemini' as SupportedProvider,
      model: 'gemini-3.5-flash-lite',
      baseCredits: 10,
      description: 'Default copy generation'
    };

    const targetModel = routing.model || 'gemini-3.5-flash-lite';
    const requiredCredits = routing.baseCredits;

    // 4. Server-Authoritative Credit Balance Check
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

    const { data: wallet, error: walletError } = await adminClient
      .from('credit_wallets')
      .select('monthly_credits_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    const availableCredits = wallet?.monthly_credits_remaining ?? 0;
    if (availableCredits < requiredCredits) {
      return new Response(
        JSON.stringify({
          error: "You don't have enough credits for this generation.",
          requiredCredits,
          availableCredits
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Build Structured Prompts
    const { systemPrompt, userPrompt } = buildToolPrompts(toolId, inputs);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // 6. Retrieve Gemini API Key from Server Secrets
    const providerApiKey = Deno.env.get('GEMINI_API_KEY') || '';

    if (!providerApiKey) {
      return new Response(
        JSON.stringify({
          error: 'AI generation is temporarily unavailable. Please try again.',
          detail: 'GEMINI_API_KEY is not configured in Supabase Edge Function secrets.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Initiate Real Gemini 3.5 Flash-Lite Stream
    const rawStream = await streamGemini(
      targetModel,
      messages,
      providerApiKey,
      parameters.maxTokens || 2500
    );

    const encoder = new TextEncoder();
    const reader = rawStream.getReader();
    let accumulatedText = '';

    // 8. Transform to SSE Stream & Persist on Completion
    const sseStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            accumulatedText += value;

            // Stream chunk to client as SSE
            const sseChunk = `data: ${JSON.stringify({ chunk: value })}\n\n`;
            controller.enqueue(encoder.encode(sseChunk));
          }

          // Compute word count server-side
          const wordCount = accumulatedText.trim().split(/\s+/).filter(Boolean).length;
          const title = inputs.topic || inputs.productName || inputs.recipient || inputs.description?.slice(0, 30) || `${toolId} Result`;

          // Persist generation to database (triggers on_generation_created credit deduction)
          const { data: savedGen, error: saveError } = await adminClient
            .from('generations')
            .insert({
              user_id: user.id,
              tool_id: toolId,
              model_id: targetModel,
              title,
              input_params: inputs,
              output_text: accumulatedText,
              word_count: wordCount,
              credits_deducted: requiredCredits,
              is_favorite: false
            })
            .select()
            .single();

          if (saveError) {
            console.error('Error persisting generation record:', saveError);
          }

          // Send terminal completion event
          const donePayload = `data: ${JSON.stringify({
            done: true,
            generationId: savedGen?.id || null,
            wordCount,
            creditsDeducted: requiredCredits,
            provider: 'gemini',
            model: targetModel
          })}\n\n`;
          controller.enqueue(encoder.encode(donePayload));

          controller.close();
        } catch (streamErr) {
          console.error('Streaming error during generation:', streamErr);
          const errorPayload = `data: ${JSON.stringify({ error: 'AI generation stream was interrupted. Please try again.' })}\n\n`;
          controller.enqueue(encoder.encode(errorPayload));
          controller.close();
        }
      }
    });

    return new Response(sseStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });
  } catch (err: any) {
    console.error('Unhandled Edge Function error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'AI generation is temporarily unavailable. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
