import {
  Sparkles,
  FileText,
  Mail,
  Instagram,
  Facebook,
  ShoppingBag,
  History,
  User,
  Settings,
  LayoutDashboard,
  Zap,
  CreditCard
} from 'lucide-react';
import { PLANS } from '../services/billing/billingService';

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  EXPLORE_TOOLS: '/explore-tools',
  DASHBOARD: '/dashboard',
  TOOLS: '/tools',
  HISTORY: '/history',
  PROFILE: '/profile',
  PRICING: '/pricing',
  // Resources
  HELP_CENTER: '/resources/help-center',
  GETTING_STARTED: '/resources/getting-started',
  GUIDES: '/resources/guides',
  // Legal
  TERMS: '/legal/terms',
  PRIVACY: '/legal/privacy',
  COOKIES: '/legal/cookies'
};

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, route: ROUTES.DASHBOARD },
  { label: 'AI Tools', icon: Sparkles, route: ROUTES.TOOLS },
  { label: 'History', icon: History, route: ROUTES.HISTORY },
  { label: 'Account Profile', icon: User, route: ROUTES.PROFILE }
];

export const AI_TOOLS = [
  {
    id: "blog-writer",
    name: "Blog Article Writer",
    category: "Writing",
    description: "Generate engaging blog posts complete with structured headers, introduction, and conclusion.",
    icon: FileText,
    badge: "Long-form",
    color: "blue",
    inputs: [
      { id: "topic", label: "Article Topic or Title", type: "text", placeholder: "e.g. 10 Remote Work Productivity Hacks for 2026" },
      { id: "keywords", label: "Target Keywords (comma separated)", type: "text", placeholder: "e.g. productivity, remote work, time management" },
      { id: "tone", label: "Writing Tone", type: "select", options: ["Professional", "Casual", "Informative", "Persuasive", "Humorous"] }
    ]
  },
  {
    id: "email-writer",
    name: "Cold Email & Newsletter Writer",
    category: "Email",
    description: "Craft high-converting sales outreach, client pitches, and engaging newsletter campaigns.",
    icon: Mail,
    badge: "Outreach",
    color: "indigo",
    inputs: [
      { id: "recipient", label: "Target Recipient / Industry", type: "text", placeholder: "e.g. SaaS Marketing Directors, VP of Sales" },
      { id: "offer", label: "Core Value Proposition / Offer", type: "textarea", placeholder: "e.g. We help B2B companies automate content marketing with AI workflows" },
      { id: "callToAction", label: "Desired Call to Action", type: "text", placeholder: "e.g. 15-minute quick discovery call next Tuesday" }
    ]
  },
  {
    id: "instagram-caption",
    name: "Instagram Caption Generator",
    category: "Social Media",
    description: "Create viral, scroll-stopping captions with strategic hashtags, emojis, and call-to-actions.",
    icon: Instagram,
    badge: "Viral",
    color: "pink",
    inputs: [
      { id: "description", label: "What is your post about?", type: "textarea", placeholder: "e.g. Behind the scenes of our new workspace setup with morning coffee" },
      { id: "mood", label: "Vibe & Style", type: "select", options: ["Inspiring & Motivational", "Witty & Playful", "Direct & Minimal", "Storytelling"] },
      { id: "includeHashtags", label: "Hashtag Strategy", type: "select", options: ["5-10 High Growth Hashtags", "15-20 Niche Hashtags", "No Hashtags"] }
    ]
  },
  {
    id: "facebook-ads",
    name: "Facebook & Instagram Ads Copy",
    category: "Marketing",
    description: "Generate high-converting primary text, headlines, and descriptions tailored for Meta ads.",
    icon: Facebook,
    badge: "High ROAS",
    color: "purple",
    inputs: [
      { id: "productName", label: "Product / Service Name", type: "text", placeholder: "e.g. AI Content Studio Pro" },
      { id: "painPoint", label: "Customer Pain Point", type: "textarea", placeholder: "e.g. Wasting 20+ hours a week writing manual blog posts and ad copies" },
      { id: "cta", label: "Call to Action Button", type: "select", options: ["Sign Up Free", "Get Started Now", "Claim Discount", "Book a Demo"] }
    ]
  },
  {
    id: "product-description",
    name: "E-Commerce Product Description",
    category: "E-Commerce",
    description: "Write SEO-optimized, bulleted product descriptions that drive Shopify and Amazon conversions.",
    icon: ShoppingBag,
    badge: "Conversion",
    color: "teal",
    inputs: [
      { id: "productName", label: "Product Title", type: "text", placeholder: "e.g. Ergonomic Memory Foam Gaming Chair" },
      { id: "features", label: "Key Features & Specs", type: "textarea", placeholder: "e.g. Lumbar support, breathable mesh, 4D armrests, 300 lbs capacity" },
      { id: "targetAudience", label: "Target Customer", type: "text", placeholder: "e.g. Gamers, remote software engineers" }
    ]
  }
];

export const PRICING_PLANS = Object.values(PLANS);
