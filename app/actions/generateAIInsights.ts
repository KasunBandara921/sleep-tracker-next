'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

interface AIInsightResult {
  insight?: string;
  isMocked: boolean;
  error?: string;
}

export async function generateAIInsights(userQuestion?: string): Promise<AIInsightResult> {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'User not authenticated', isMocked: true };
  }

  try {
    // Retrieve the user's sleep records
    const records = await db.record.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30, // Analyze up to last 30 entries
    });

    if (records.length === 0) {
      return {
        insight: `### 💤 No Sleep Data Yet
To receive personalized AI insights, please start by recording your sleep on the home page. Once you have logged at least one sleep record, our AI Sleep Coach will analyze your patterns!`,
        isMocked: true,
      };
    }

    // Calculate stats for the prompt/mock generator
    const totalDays = records.length;
    const totalHours = records.reduce((sum, r) => sum + r.amount, 0);
    const averageHours = totalHours / totalDays;
    const maxSleep = Math.max(...records.map((r) => r.amount));
    const minSleep = Math.min(...records.map((r) => r.amount));

    // Calculate sleep debt (assuming 8 hours is target)
    const targetHours = 8;
    const sleepDebt = records.reduce((debt, r) => debt + (targetHours - r.amount), 0);

    // Get unique sleep modes/notes
    const sleepModes = Array.from(new Set(records.map((r) => r.text).filter(Boolean)));

    // Create system / user prompt
    let prompt = '';

    if (userQuestion && userQuestion.trim() !== '') {
      prompt = `You are a professional AI Sleep Coach. Analyze the user's recent sleep data:
- Average Sleep Duration: ${averageHours.toFixed(2)} hours/night
- Total Tracked Days: ${totalDays}
- Best Sleep Night: ${maxSleep} hours
- Worst Sleep Night: ${minSleep} hours
- Cumulative Sleep Debt (vs 8h target): ${sleepDebt.toFixed(1)} hours
- Recorded Sleep Quality Tags/Modes: ${sleepModes.join(', ') || 'None recorded'}

Recent logs detail:
${records.map((r) => `- Date: ${new Date(r.date).toLocaleDateString()}, Duration: ${r.amount}h, Notes: "${r.text}"`).join('\n')}

The user has asked the following specific question about their sleep:
"${userQuestion}"

Instructions for your response:
1. Answer the user's question directly.
2. CRITICAL: Do NOT list or repeat the raw sleep logs, dates, or input statistics in your response.
3. Keep the response extremely concise (under 75 words / 2-3 sentences max).
4. Do not include any greeting or conversational filler.`;
    } else {
      prompt = `You are a professional AI Sleep Coach. Analyze the user's recent sleep data:
- Average Sleep Duration: ${averageHours.toFixed(2)} hours/night
- Total Tracked Days: ${totalDays}
- Best Sleep Night: ${maxSleep} hours
- Worst Sleep Night: ${minSleep} hours
- Cumulative Sleep Debt (vs 8h target): ${sleepDebt.toFixed(1)} hours
- Recorded Sleep Quality Tags/Modes: ${sleepModes.join(', ') || 'None recorded'}

Recent logs detail:
${records.map((r) => `- Date: ${new Date(r.date).toLocaleDateString()}, Duration: ${r.amount}h, Notes: "${r.text}"`).join('\n')}

Provide a structured, extremely concise sleep review containing:
1. **Sleep Analysis**: Summarize patterns in 2 sentences.
2. **Key Recommendations**: Give 3 very brief bullet points.
CRITICAL RULE: Do NOT repeat, list, or print the raw logs in your output. Keep the entire response under 150 words. Do not include introductory/outro conversational fluff.`;
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        error: 'Groq API Key (GROQ_API_KEY) is not configured. Please add it to your .env file.',
        isMocked: false,
      };
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'groq/compound',
        messages: [
          {
            role: 'system',
            content: 'You are a direct, concise, and professional AI Sleep Coach who provides scientific, actionable advice based on sleep journals. Format response as pure Markdown, starting directly with the analysis. Never repeat the raw input logs or print lists of raw dates in your output. Keep answers extremely short and exact.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const insightText = data.choices?.[0]?.message?.content;

    if (!insightText) {
      throw new Error('Groq API returned an empty response.');
    }

    // Clean up thinking blocks (<think>...</think>) returned by reasoning models
    let cleanInsight = insightText;
    if (cleanInsight.includes('<think>')) {
      cleanInsight = cleanInsight.replace(/<think>[\s\S]*?<\/think>/g, '');
      const thinkIndex = cleanInsight.indexOf('<think>');
      if (thinkIndex !== -1) {
        cleanInsight = cleanInsight.substring(0, thinkIndex);
      }
    }
    cleanInsight = cleanInsight.trim();

    return { insight: cleanInsight, isMocked: false };
  } catch (error: any) {
    console.error('Error generating AI Insights:', error);
    return {
      error: error?.message || 'Failed to process sleep insights.',
      isMocked: false,
    };
  }
}
