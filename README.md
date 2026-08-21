# AI Content Studio

A production-grade SaaS AI copywriting and content generation workspace powered by Google Gemini and Supabase.

## Features
- **5 High-Performance AI Tools**:
  - Blog Writer (Long-form SEO blog posts with markdown output)
  - Email Writer (High-converting sales outreach, client pitches, and newsletters)
  - Instagram Captions (Punchy captions with emoji integration and strategic hashtags)
  - Facebook Ads (Structured Meta ad copy: primary text, headlines, descriptions, CTA)
  - Product Descriptions (E-commerce copy optimized for Shopify & Amazon listings)
- **Production Supabase Integration**:
  - Auth with Email/Password & Google OAuth
  - Credit Economics & Billing Management (Free Tier 60 credits/mo)
  - Serverless AI Generation via Supabase Edge Function (`ai-generate`)
  - Server-Sent Events (SSE) streaming engine powered by `gemini-3.5-flash-lite`

## Architecture & Security
- **Edge Function API Secrets**: API keys (e.g. `GEMINI_API_KEY`) reside exclusively in Supabase Edge Function Secrets. No provider keys are exposed in the frontend client.
- **Client Environment**: Public Supabase URL and Anon key are managed via `.env` (excluded from repository) and `.env.example`.

## Setup & Development
1. Clone the repository:
   ```bash
   git clone https://github.com/nishad8997-spec/ai-content-studio.git
   cd ai-content-studio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   # Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```
4. Start local development server:
   ```bash
   npm run dev
   ```
5. Production build:
   ```bash
   npm run build
   ```

## Repository Structure
```
├── public/               # Static assets
├── src/                  # React frontend codebase
│   ├── components/       # UI components (Auth, Navigation, Dashboard, Tools)
│   ├── config/           # App configuration & constants
│   ├── context/          # React Context (Auth, Theme, Workspace)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components & views
│   ├── services/         # API & Supabase services
│   └── utils/            # Helper utilities
├── supabase/             # Supabase backend definitions
│   ├── functions/        # Deno Edge Functions (ai-generate)
│   └── migrations/       # Production SQL schema & migrations
├── .env.example          # Environment variable template
├── .gitignore            # Git exclusion definitions
├── index.html            # Main HTML entrypoint
├── package.json          # Node.js dependencies & scripts
└── vite.config.js        # Vite bundler configuration
```
