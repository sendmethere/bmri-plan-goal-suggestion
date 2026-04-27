import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, weekData } = await req.json();

  const goalsText = (weekData?.goals ?? []).map((g: { text: string }) => g.text).join(', ') || '없음';
  const tasksText = Object.values(weekData?.tasks ?? {})
    .flat()
    .map((t: unknown) => (t as { text: string }).text)
    .join(', ') || '없음';

  const system = `당신은 초등/중학생의 학습 목표와 계획 수립을 돕는 친절한 AI 튜터입니다.
이번 주 목표: ${goalsText}
이번 주 계획: ${tasksText}
학생이 목표를 세우거나 학습 계획을 만들 때 구체적이고 격려하는 방식으로 도움을 주세요.
답변은 간결하게 3-4문장 이내로 해주세요.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: system }, ...messages],
    max_tokens: 400,
  });

  return NextResponse.json({
    message: response.choices[0].message.content,
    usage: response.usage,
  });
}
