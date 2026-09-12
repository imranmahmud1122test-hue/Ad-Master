import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Clean JSON response helper from Gemini text
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// -------------------------------------------------------------
// 1. Health Check
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AdMaster AI Platform',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 2. AI Video Script Generator
// -------------------------------------------------------------
app.post('/api/ai/video-script', async (req, res) => {
  try {
    const {
      product,
      targetAudience,
      platform = 'Facebook',
      videoFormat = '9:16',
      videoLength = '30 seconds',
      tone = 'Promotional',
      callToAction = 'Shop Now',
      businessName,
      businessCategory,
    } = req.body;

    if (!product || !targetAudience) {
      return res.status(400).json({
        error: 'Please provide what you are promoting and your target audience.',
      });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a world-class direct-response video advertising director specializing in ${platform} video ads.
You craft high-converting video scripts using real buyer psychology, scroll-stopping visual hooks, punchy voiceovers, and clear calls to action.
DO NOT fabricate unsubstantiated medical or guarantee claims. Only use the product attributes provided.

Output MUST be strictly valid JSON without markdown wrapping matching this structure:
{
  "title": "Short Catchy Ad Title",
  "hook": {
    "timestamp": "0:00–0:03",
    "text": "Exact script voiceover line for the first 3 seconds",
    "rationale": "Brief explanation why this stops the scroll"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "0:03–0:08",
      "voiceover": "Spoken line",
      "onScreenText": "Short bold on-screen overlay (3-6 words)",
      "visualDirection": "Action shot, camera angle, creator movement, or product close-up"
    }
  ],
  "cta": "Final closing voiceover & on-screen button CTA",
  "caption": "High-converting social caption with emoji and clean paragraph breaks",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

    const prompt = `Create a ${videoLength} high-converting ${platform} ad script (${videoFormat} format).
Business: ${businessName || 'Business'} (${businessCategory || 'Commerce'})
Product / Service: ${product}
Target Audience: ${targetAudience}
Tone of Voice: ${tone}
Desired CTA: ${callToAction}
Format: ${videoFormat}
Length: ${videoLength}

Ensure the scenes span the entire ${videoLength} duration realistically with 3 to 5 scenes following the Hook -> Problem/Agitation -> Solution/Benefit -> Social Proof -> CTA formula.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nTask:\n${prompt}` }] },
      ],
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = extractJsonFromText(text);

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating video script:', error);
    return res.status(500).json({
      error: error.message?.includes('GEMINI_API_KEY')
        ? 'Gemini API key is not configured. Please set GEMINI_API_KEY.'
        : 'Failed to generate video script. Please check your inputs and try again.',
    });
  }
});

// -------------------------------------------------------------
// 3. AI Marketing Content Generator (Captions, Hooks, Posts, CTAs, Hashtags)
// -------------------------------------------------------------
app.post('/api/ai/content', async (req, res) => {
  try {
    const {
      product,
      audience,
      mainBenefit,
      offer,
      tone = 'Conversational',
      goal = 'Sales',
    } = req.body;

    if (!product) {
      return res.status(400).json({ error: 'Product or service description is required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an elite direct-response marketing copywriter for social media and Facebook ads.
Produce punchy, compelling marketing variations for the user's product or service.
DO NOT hallucinate fake product claims.

Output MUST be strictly valid JSON matching:
{
  "topic": "Concise summary",
  "captions": ["Caption variation 1 (with emojis & breaks)", "Caption variation 2", "Caption variation 3"],
  "posts": ["Full post 1 with storytelling", "Full post 2 with bullet benefits"],
  "hooks": ["Scroll-stopping question hook", "Negative bias hook (e.g. Stop doing X)", "Curiosity gap hook", "Benefit-driven hook", "Social proof hook"],
  "ctas": ["Direct CTA 1", "Urgency CTA 2", "Soft low-friction CTA 3", "Value-led CTA 4"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"]
}`;

    const prompt = `Generate high-converting marketing content:
Product / Service: ${product}
Target Audience: ${audience || 'Potential customers'}
Main Benefit: ${mainBenefit || 'High quality and fast results'}
Special Offer / Promotion: ${offer || 'Limited time availability'}
Tone: ${tone}
Goal: ${goal}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nTask:\n${prompt}` }] },
      ],
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      error: 'Failed to generate content. Please try again.',
    });
  }
});

// -------------------------------------------------------------
// 4. AI Ads Campaign Planner
// -------------------------------------------------------------
app.post('/api/ai/ad-planner', async (req, res) => {
  try {
    const {
      campaignObjective,
      product,
      websiteUrl,
      targetAudience,
      budget,
      creative,
      cta,
    } = req.body;

    if (!product || !campaignObjective) {
      return res.status(400).json({ error: 'Objective and product description are required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a certified Facebook Ads (Meta Ads) Strategic Media Buyer.
Generate a structured, actionable Facebook advertising campaign strategy blueprint.
NOTE: Clearly explain that this is a strategic planning guide to implement in Meta Ads Manager. Do not claim ads are automatically live.

Output MUST be strictly valid JSON matching:
{
  "campaignObjective": "Recommended Meta campaign objective with explanation",
  "recommendedAudience": {
    "summary": "High-level targeting profile",
    "demographics": "Age, gender, language, location specifics",
    "interests": ["Interest targeting option 1", "Interest 2", "Competitor/Category 3", "Broad targeting note"],
    "behaviors": ["Purchase behavior / digital activity behaviors"]
  },
  "creativeStrategy": {
    "visualHooks": ["3-second visual hook concept 1", "Hook concept 2", "Hook concept 3"],
    "adFormats": ["Recommended format 1 (e.g., UGC Reels 9:16)", "Format 2 (e.g., Carousel showcase)"],
    "angles": ["Pain point angle", "Before/After or Transformation angle", "Social proof/Review angle"]
  },
  "budgetStrategy": {
    "dailyBudget": "Recommended starting budget allocation",
    "allocation": "Distribution between Testing (70%) vs Retargeting/Scaling (30%)",
    "duration": "Testing timeline before scaling or killing ad sets",
    "expectedMetrics": "Estimated benchmark targets (e.g., target CTR, estimated CPC range)"
  },
  "cta": "Optimal button CTA for this objective",
  "testingRecommendations": [
    "A/B test 3 different hooks with the same body",
    "Test 2 distinct audience ad sets against 1 broad set",
    "Run for minimum 3-5 days to exit Meta learning phase"
  ],
  "potentialRisks": [
    "Ad fatigue if creative is not refreshed every 2-3 weeks",
    "Over-narrow audience causing high CPMs"
  ],
  "optimizationSuggestions": [
    "Turn off creatives with CTR below 0.8% after 1,000 impressions",
    "Scale ad sets producing positive ROAS by 15-20% every 48 hours"
  ]
}`;

    const prompt = `Plan a complete Facebook Ad Campaign:
Campaign Objective: ${campaignObjective}
Product / Service: ${product}
Landing Page / Website: ${websiteUrl || 'Not provided'}
Audience Details: Location: ${targetAudience?.location || 'Worldwide/Target Country'}, Age: ${targetAudience?.age || '22-55'}, Gender: ${targetAudience?.gender || 'All'}, Interests: ${targetAudience?.interests || 'General category buyers'}, Customer Type: ${targetAudience?.customerType || 'B2C'}
Budget: $${budget?.dailyBudget || '25'}/day for ${budget?.duration || '14 days'}
Selected Creative Format: ${creative || 'Video 9:16'}
Call to Action: ${cta || 'Learn More'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nTask:\n${prompt}` }] },
      ],
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error planning ad campaign:', error);
    return res.status(500).json({
      error: 'Failed to generate ad campaign plan. Please try again.',
    });
  }
});

// -------------------------------------------------------------
// 5. AI Ad Performance Analyzer
// -------------------------------------------------------------
app.post('/api/ai/ad-analyzer', async (req, res) => {
  try {
    const {
      spend = 0,
      reach = 0,
      impressions = 0,
      clicks = 0,
      conversions = 0,
      revenue = 0,
      notes = '',
    } = req.body;

    const numSpend = Number(spend) || 0;
    const numImpressions = Number(impressions) || 0;
    const numClicks = Number(clicks) || 0;
    const numConversions = Number(conversions) || 0;
    const numRevenue = Number(revenue) || 0;
    const numReach = Number(reach) || 0;

    if (numSpend <= 0 || numImpressions <= 0) {
      return res.status(400).json({
        error: 'Please enter valid numbers for Spend and Impressions to analyze performance.',
      });
    }

    // Precise Server-Side Calculations
    const ctr = numImpressions > 0 ? (numClicks / numImpressions) * 100 : 0;
    const cpc = numClicks > 0 ? numSpend / numClicks : 0;
    const roas = numSpend > 0 ? numRevenue / numSpend : 0;
    const cpa = numConversions > 0 ? numSpend / numConversions : 0;
    const conversionRate = numClicks > 0 ? (numConversions / numClicks) * 100 : 0;
    const cpm = numImpressions > 0 ? (numSpend / numImpressions) * 1000 : 0;

    const metrics = {
      spend: numSpend,
      reach: numReach,
      impressions: numImpressions,
      clicks: numClicks,
      conversions: numConversions,
      revenue: numRevenue,
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2)),
      roas: Number(roas.toFixed(2)),
      cpa: Number(cpa.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
      cpm: Number(cpm.toFixed(2)),
    };

    const ai = getGeminiClient();

    const systemPrompt = `You are a Senior Meta Ads Performance Analyst.
You evaluate advertising metrics against industry standards (e.g. standard Meta benchmarks: CTR 1.0-1.5%, CPC $0.50-$2.00 depending on niche, CPM $15-$35, ROAS > 2.0x for e-commerce).
You give clear, realistic diagnostic feedback. Do not present assumptions as absolute facts; state them clearly as data-driven recommendations.

Output MUST be strictly valid JSON matching:
{
  "performanceSummary": "A 2-3 sentence executive evaluation of this campaign's health and profitability.",
  "strengths": ["Strength 1 with metric context", "Strength 2"],
  "weaknesses": ["Area of concern 1", "Area of concern 2"],
  "possibleProblems": ["Probable root cause (e.g. ad creative fatigue, landing page conversion friction, high CPM due to saturated audience)"],
  "aiRecommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "nextActions": [
    "Step 1 to do in Ads Manager today",
    "Step 2 to test this week"
  ]
}`;

    const prompt = `Analyze these Meta advertising campaign results:
Calculated Metrics:
- Total Spend: $${metrics.spend}
- Impressions: ${metrics.impressions.toLocaleString()}
- Reach: ${metrics.reach ? metrics.reach.toLocaleString() : 'N/A'}
- Clicks: ${metrics.clicks.toLocaleString()}
- Click-Through Rate (CTR): ${metrics.ctr}%
- Cost Per Click (CPC): $${metrics.cpc}
- Cost Per 1,000 Impressions (CPM): $${metrics.cpm}
- Total Conversions: ${metrics.conversions}
- Conversion Rate: ${metrics.conversionRate}%
- Cost Per Acquisition (CPA): $${metrics.cpa}
- Total Revenue: $${metrics.revenue}
- Return On Ad Spend (ROAS): ${metrics.roas}x
User notes / context: ${notes || 'Standard paid campaign'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nTask:\n${prompt}` }] },
      ],
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');

    return res.json({
      success: true,
      data: {
        metrics,
        performanceSummary: parsed.performanceSummary || 'Performance analysis calculated.',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        possibleProblems: parsed.possibleProblems || [],
        aiRecommendations: parsed.aiRecommendations || [],
        nextActions: parsed.nextActions || [],
      },
    });
  } catch (error: any) {
    console.error('Error analyzing ad performance:', error);
    return res.status(500).json({
      error: 'Failed to analyze campaign performance. Please check your data.',
    });
  }
});

// -------------------------------------------------------------
// 6. AI Text Improvement / Quick Variations
// -------------------------------------------------------------
app.post('/api/ai/improve', async (req, res) => {
  try {
    const { originalText, instruction = 'Make it punchier and higher converting', tone } = req.body;

    if (!originalText) {
      return res.status(400).json({ error: 'Text to improve is required.' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert copy doctor.
Rewrite the following marketing text following this instruction: "${instruction}" ${tone ? `with tone "${tone}"` : ''}.
Provide:
1. The improved version
2. A brief 1-sentence explanation of what was improved.

Original text:
${originalText}

Output JSON format:
{
  "improvedText": "...",
  "explanation": "..."
}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error improving text:', error);
    return res.status(500).json({ error: 'Failed to improve text.' });
  }
});

// -------------------------------------------------------------
// 7. Vite Integration and Server Start
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdMaster AI Server running on port ${PORT}`);
  });
}

startServer();
