'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  {
    title: '📌 앱 소개',
    content:
      '학습 플래너는 초등·중학생이 주간 학습 목표를 세우고, 이를 달성하기 위한 일별 세부 계획을 관리할 수 있도록 돕는 앱입니다. AI가 입력을 도와주고, 챗봇이 목표 설정까지 함께 고민해줍니다.',
  },
  {
    title: '🎯 주간 목표',
    items: [
      '이번 주 핵심 학습 목표를 1개 설정합니다.',
      '목표는 달성 여부를 체크하거나 삭제할 수 있습니다.',
      '목표를 지우면 새 목표를 다시 입력할 수 있습니다.',
    ],
  },
  {
    title: '📅 일별 계획',
    items: [
      '월~일 요일 탭에서 날짜를 선택해 계획을 추가합니다.',
      '각 계획은 체크박스로 완료 처리하거나 삭제할 수 있습니다.',
      '계획은 주간 목표와 연결된 구체적인 행동으로 채워지는 것이 좋습니다.',
    ],
  },
  {
    title: '✨ AI 자동 제안',
    items: [
      '입력창이 비어 있을 때 포커스하면 즉시 제안이 표시됩니다.',
      '타이핑 후 3초 이상 멈추면 입력 내용을 반영한 제안이 나타납니다.',
      '제안은 지난주 목표·계획과 이번 주 목표를 기반으로 생성됩니다.',
      '제안은 난이도 순(쉬움 → 보통 → 어려움)으로 3가지가 제시됩니다.',
    ],
    keyboard: [
      { key: 'Tab', desc: '현재 선택된 제안을 입력창에 반영' },
      { key: '← →', desc: '이전·다음 제안으로 이동' },
      { key: 'Esc', desc: '제안 닫기' },
      { key: 'Enter', desc: '입력된 내용 바로 추가' },
    ],
  },
  {
    title: '🤖 AI 튜터 챗봇',
    items: [
      '헤더 오른쪽 또는 우측 하단 버튼으로 챗봇을 열 수 있습니다.',
      '목표 설정이 막막할 때 챗봇에게 도움을 요청해보세요.',
      '챗봇은 현재 주간 목표와 계획을 알고 있어 맥락에 맞는 조언을 제공합니다.',
    ],
  },
  {
    title: '💾 데이터 저장',
    items: [
      '모든 목표·계획은 브라우저의 로컬 스토리지에 저장됩니다.',
      '주차별로 데이터가 분리 저장되어 지난주 내역이 이번 주 제안에 활용됩니다.',
      '헤더의 초기화(↺) 버튼으로 전체 데이터를 삭제할 수 있습니다.',
    ],
  },
  {
    title: '📊 토큰 로그',
    items: [
      'AI 자동 제안과 챗봇 호출 시 사용된 토큰이 기록됩니다.',
      '각 호출의 입력·출력 토큰과 예상 비용(gpt-4o-mini 기준)을 확인할 수 있습니다.',
      '확대 버튼을 눌러 전체 내역을 테이블 형태로 볼 수 있습니다.',
    ],
  },
];

export function GuideModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] w-[520px] max-h-[85vh] flex flex-col gap-3 p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base">앱 사용 가이드</DialogTitle>
          <p className="text-xs text-muted-foreground">학습 플래너의 주요 기능과 사용 방법</p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-5 pb-5">
          <div className="space-y-5 pt-1">
            {sections.map((sec) => (
              <div key={sec.title}>
                <p className="text-sm font-semibold mb-1.5">{sec.title}</p>

                {'content' in sec && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{sec.content}</p>
                )}

                {'items' in sec && sec.items && (
                  <ul className="space-y-1">
                    {sec.items.map((item) => (
                      <li key={item} className="flex gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {'keyboard' in sec && sec.keyboard && (
                  <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 space-y-1">
                    {sec.keyboard.map((k) => (
                      <div key={k.key} className="flex items-center gap-2 text-xs">
                        <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium shrink-0">
                          {k.key}
                        </kbd>
                        <span className="text-muted-foreground">{k.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
