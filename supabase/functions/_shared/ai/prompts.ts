// ============================================================================
// Production Prompt Builder for AI Copywriting Tools
// ============================================================================

import { ChatMessage } from './types.ts';

/**
 * Builds structured system and user prompts for the 5 specialized AI copywriting tools.
 */
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
2. Compelling introduction that hooks the reader and outlines the problem.
3. 3-4 deep, actionable H2 sections with practical frameworks, bullet points, and numbered lists.
4. Seamless inclusion of target keywords without keyword stuffing.
5. Memorable blockquote or pro-tip.
6. Clear, actionable conclusion and Key Takeaways.
Never output meta commentary or conversational filler. Deliver only the finished markdown article.`;

      const userPrompt = `Please write a complete, in-depth blog post on the following topic:
Topic/Title: "${topic}"
Target Keywords: "${keywords}"
Tone: ${tone}`;

      return { systemPrompt, userPrompt };
    }

    case 'email-writer': {
      const recipient = inputs.recipient?.trim() || 'Growth & Marketing Leaders';
      const offer = inputs.offer?.trim() || 'Automate content workflows and save 15+ hours weekly';
      const callToAction = inputs.callToAction?.trim() || '15-minute quick discovery call';

      const systemPrompt = `You are an elite direct-response email copywriter specializing in B2B sales outreach and high-open-rate newsletters.
Your goal is to write a high-converting cold outreach email with high reply rates.
Format requirements:
1. 3 punchy, high-open-rate Subject Line variations (Curiosity, Benefit, Direct).
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
