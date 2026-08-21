/**
 * Mock AI Stream Provider (Input-Aware Local Generator)
 * Simulates high-quality, real-time chunked streaming generation.
 * Synthesizes dynamic, structured content from user inputs for testing before Sprint 3A.
 */

function generateBlogContent(inputs) {
  const topic = inputs.topic?.trim() || "Modern Content Strategy & Growth";
  const rawKeywords = inputs.keywords?.trim() || "innovation, content creation, efficiency";
  const tone = inputs.tone || "Professional";

  const keywordsList = rawKeywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const keywordSection1 = keywordsList[0] || "strategic workflow optimization";
  const keywordSection2 = keywordsList[1] || "high-impact automation";
  const keywordSection3 = keywordsList[2] || "sustainable consistency";

  return `
# ${topic}

In today's fast-evolving landscape, understanding and mastering **${topic}** has become a vital priority for creators, teams, and ambitious brands. Written with a **${tone}** perspective, this comprehensive guide breaks down actionable frameworks and proven insights to help you achieve measurable results.

---

## 1. The Core Foundation: Mastering ${keywordSection1.toUpperCase()}

Every successful initiative starts with a crystal-clear understanding of ${keywordSection1}. When you establish strong fundamentals, complex challenges become manageable execution steps:

- **Audit your current baseline:** Identify where bottlenecks slow down your progress and measure your current turnaround time.
- **Implement structured workflows:** Standardize routines so your team spends less time guessing and more time delivering.
- **Maintain focus on value:** Ensure every action aligns directly with your primary objective: *${topic}*.

> *"Excellence is not an accident; it is the natural outcome of high intention, intelligent direction, and skillful execution."*

---

## 2. Unlocking Next-Level Scale through ${keywordSection2.toUpperCase()}

Moving beyond the basics requires embracing ${keywordSection2}. Modern leaders leverage technology and structured methodologies to multiply their output:

1. **Automate repetitive low-value tasks:** Free up creative energy for deep strategic thinking.
2. **Standardize quality checks:** Ensure consistency across every touchpoint without manual micromanagement.
3. **Iterate based on data:** Monitor performance indicators and refine your approach on a weekly cadence.

By focusing on ${keywordSection2}, you eliminate friction and accelerate delivery timelines by up to 300%.

---

## 3. Building Long-Term Advantage with ${keywordSection3.toUpperCase()}

The differentiator between short-lived campaigns and enduring success is ${keywordSection3}. Here is how to embed this into your day-to-day operations:

- **Create a sustainable cadence:** Prioritize consistency over sporadic bursts of effort.
- **Document institutional knowledge:** Build playbooks so insights are easily shared and executed.
- **Foster continuous improvement:** Regularly review what worked, what failed, and adapt swiftly.

---

## Key Takeaways & Action Plan

To put the strategies from this guide on **${topic}** into immediate practice:

1. Pick **one** area of ${keywordSection1} to optimize within the next 24 hours.
2. Integrate ${keywordSection2} into your weekly planning review.
3. Review your progress after 14 days and scale what produces the highest return.

With dedicated execution and the right tools, mastering ${topic} will transform your workflow and set new benchmarks for your output.
`;
}

function generateEmailContent(inputs) {
  const recipient = inputs.recipient?.trim() || "Marketing & Growth Leaders";
  const offer = inputs.offer?.trim() || "streamline your content workflows and save 15+ hours every week";
  const cta = inputs.callToAction?.trim() || "a quick 10-minute intro call next Tuesday at 2 PM EST";

  return `
### Subject Line Options:
- **Option 1 (Direct):** Quick question regarding ${recipient}
- **Option 2 (Value-Driven):** A smarter way to ${offer.slice(0, 45)}...
- **Option 3 (Curiosity):** Thoughts on scaling output for ${recipient}?

---

Hi [First Name],

I hope you're having a productive week!

I've been following your team's recent milestones in the ${recipient} space and was especially impressed by your approach to driving growth.

Reaching out because many teams like yours frequently tell us they struggle with balancing content turnaround times while keeping quality exceptionally high.

We developed a dedicated solution that enables ${recipient} to:

• **${offer}**
• Accelerate turnaround from days to minutes with structured AI templates
• Maintain strict brand voice consistency across all outreach and campaigns

Would you be open to **${cta}** to see if this makes sense for your current quarterly roadmap?

If you're interested, feel free to reply directly to this email or grab a time on my calendar.

Best regards,

**[Your Name]**  
Growth & Strategy Lead  
AI Content Studio
`;
}

function generateInstagramContent(inputs) {
  const description = inputs.description?.trim() || "Excited to share our latest project milestone and behind-the-scenes workflow";
  const mood = inputs.mood || "Inspiring & Motivational";
  const hashtagOption = inputs.includeHashtags || "5-10 High Growth Hashtags";

  let hook = "✨ Big things happen when vision meets relentless focus.";
  let vibeText = "Taking you behind the scenes today. Building with intention and watching the pieces fall into place. 🚀";

  if (mood.includes("Witty")) {
    hook = "☕ Running on pure caffeine, big ambitions, and zero apologies.";
    vibeText = "They said it couldn't be done in one afternoon. Clearly, they haven't seen our latest workflow setup in action. 😉🔥";
  } else if (mood.includes("Direct")) {
    hook = "📌 Simple truths. Real results.";
    vibeText = "Here is the exact focus behind our latest update: clear goals, zero fluff, maximum execution.";
  } else if (mood.includes("Storytelling")) {
    hook = "📖 Every milestone starts with a decision to try.";
    vibeText = "Three months ago, this was just a rough concept on a whiteboard. Today, it is alive and out in the world.";
  }

  const generatedTags = description
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 4)
    .map((w) => `#${w.charAt(0).toUpperCase() + w.slice(1)}`)
    .join(" ");

  const standardTags = "#ContentCreator #AITools #CreativeStudio #GrowthMindset #ProductivityHacks #DigitalMarketing";

  return `
${hook}

${description}

${vibeText}

What is the single biggest goal you're working toward this week? Drop a comment below—let's connect! 👇💬

---
${
  hashtagOption !== "No Hashtags"
    ? `\n**Hashtags:**\n${generatedTags} ${standardTags} #BuilderCommunity`
    : ""
}
`;
}

function generateFacebookAdContent(inputs) {
  const productName = inputs.productName?.trim() || "AI Content Studio";
  const painPoint = inputs.painPoint?.trim() || "spending 20+ hours every week manually writing blog posts and outreach copy";
  const cta = inputs.cta || "Sign Up Free";

  return `
🎯 **PRIMARY TEXT:**
Tired of ${painPoint}? You're not alone.

Most creators and growth teams lose dozens of hours every week stuck in blank-page syndrome. 

Introducing **${productName}**—the purpose-built content engine designed to help you create high-converting copy in seconds.

⚡ **Why top teams switch to ${productName}:**
✅ Generate long-form blogs, outreach emails, and ad copy in 1 click
✅ 10x faster output without sacrificing your unique brand voice
✅ Built-in streaming playground with zero prompt engineering required

Join thousands of modern marketers who transformed their content workflow.

👇 Tap the link below to get started today!

---

🔥 **HEADLINE:**
Stop ${painPoint.slice(0, 30)}... | Try ${productName}

📝 **DESCRIPTION:**
250 Free Credits • No Credit Card Required • Instant Setup

👉 **CALL TO ACTION BUTTON:**
[ ${cta} ]
`;
}

function generateProductDescriptionContent(inputs) {
  const productName = inputs.productName?.trim() || "Next-Gen Ergonomic Workstation";
  const rawFeatures = inputs.features?.trim() || "Premium build quality, intuitive controls, all-day comfort, whisper-quiet operation";
  const targetAudience = inputs.targetAudience?.trim() || "remote professionals, designers, and creators";

  const featureBullets = rawFeatures
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) => `- ⚡ **${f.charAt(0).toUpperCase() + f.slice(1)}:** Engineered for peak performance and effortless daily reliability.`)
    .join("\n");

  return `
# ${productName}

Elevate your daily routine with the all-new **${productName}**. Meticulously engineered for **${targetAudience}**, this product seamlessly combines premium craftsmanship with high-impact functionality to deliver an unmatched experience.

---

### ✨ Key Features & Specifications:
${featureBullets}
- 🛡️ **Built for Durability:** Constructed from industrial-grade components designed to withstand intensive daily use.
- 🎯 **Streamlined Simplicity:** Ready to use out of the box with zero complex configuration.

---

### 👥 Who Is This For?
Specifically crafted for **${targetAudience}** who refuse to compromise on quality and demand tools that keep pace with their ambitions.

---

### 🛒 Why Choose ${productName}?
When performance matters, every detail counts. Upgrade today and experience the difference superior design makes.

**In Stock & Ready to Ship** | *Backed by our 100% Satisfaction Guarantee*
`;
}

const TEMPLATES = {
  "blog-writer": generateBlogContent,
  "email-writer": generateEmailContent,
  "instagram-caption": generateInstagramContent,
  "facebook-ads": generateFacebookAdContent,
  "product-description": generateProductDescriptionContent
};

export const mockProvider = {
  id: "mock",
  name: "Mock AI Stream Simulator",

  async generateStream(toolId, inputs, onChunk, onComplete, signal) {
    const generator = TEMPLATES[toolId] || TEMPLATES["blog-writer"];
    const fullText = generator(inputs || {}).trim();
    const words = fullText.split(" ");

    let currentText = "";
    const chunkSize = 3;

    for (let i = 0; i < words.length; i += chunkSize) {
      if (signal?.aborted) {
        return null;
      }
      const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
      currentText += chunk;
      onChunk(currentText);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }

    if (signal?.aborted) return null;

    if (onComplete) {
      onComplete(fullText);
    }

    return fullText;
  }
};
