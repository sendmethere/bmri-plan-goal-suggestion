import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { currentInput, type, lastWeekData, currentWeekGoal } = await req.json();

  const isGoal = type === 'goal';

  let prompt: string;

  if (isGoal) {
    const lastGoals = (lastWeekData?.goals ?? []).map((g: { text: string }) => g.text).join(', ') || '없음';
    prompt = `지난주 목표: ${lastGoals}
현재 입력: "${currentInput || ''}"

초등/중학생을 위한 이번 주 학습 목표 3가지를 제안해주세요.
규칙:
- 제안1: 쉽고 간단하게 달성할 수 있는 기초 수준 목표
- 제안2: 제안1보다 범위나 깊이가 넓어진 중간 수준 목표
- 제안3: 가장 도전적이고 복잡한 심화 수준 목표
- 3개의 난이도가 명확히 구분되어야 합니다
- 지난주 목표와 현재 입력을 참고하여 구체적이고 실현 가능하게 작성하세요
반드시 아래 JSON 형식으로만 응답하세요:
{"suggestions": ["제안1", "제안2", "제안3"]}`;
  } else {
    const lastTasks = Object.values(lastWeekData?.tasks ?? {})
      .flat()
      .map((t: unknown) => (t as { text: string }).text)
      .join(', ') || '없음';
    const goalLine = currentWeekGoal
      ? `이번 주 목표: "${currentWeekGoal}" ← 이 목표와 직접 연결되는 오늘의 실천 항목을 최우선으로 제안하세요.`
      : '이번 주 목표: 없음';
    prompt = `${goalLine}
지난주 계획 참고: ${lastTasks}
현재 입력: "${currentInput || ''}"

초등/중학생을 위한 오늘의 학습 계획 3가지를 제안해주세요.
규칙:
- 반드시 "~하기" 형식으로 끝나는 짧은 문장으로 작성하세요 (예: "수학 교과서 50~55쪽 풀기", "영어 단어 10개 외우기")
- 초등~중학생이 혼자서도 바로 실천할 수 있는 구체적인 행동이어야 합니다
- 이번 주 목표가 있으면 그 목표와 직접 연결되는 항목을 최우선으로 제안하세요
- 제안1: 5~10분 내 완료 가능한 가장 쉽고 단순한 행동 (예: 단어 5개 보기)
- 제안2: 15~20분 소요되는 보통 난이도 행동 (예: 교과서 한 단원 읽기)
- 제안3: 25~30분 이상 집중이 필요한 도전적인 행동 (예: 문제 풀고 오답 정리하기)
- 3개의 소요 시간과 난이도가 명확히 차이 나야 합니다
반드시 아래 JSON 형식으로만 응답하세요:
{"suggestions": ["제안1", "제안2", "제안3"]}`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });

  let suggestions: string[] = [];
  try {
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    suggestions = parsed.suggestions ?? [];
  } catch {
    suggestions = [];
  }

  return NextResponse.json({
    suggestions: suggestions.slice(0, 3),
    usage: response.usage,
    assistantMessage: suggestions.join(' / '),
  });
}
