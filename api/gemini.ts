import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server'; // If using Next/Vercel

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'google/gemini-2.5-flash' } = await request.json();
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}