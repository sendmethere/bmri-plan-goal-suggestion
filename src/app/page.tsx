'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WeeklyGoals } from '@/components/WeeklyGoals';
import { DailyPlan } from '@/components/DailyPlan';
import { ChatBot } from '@/components/ChatBot';
import { TokenLogView } from '@/components/TokenLogView';
import { getWeekKey, getWeekData, clearAllData } from '@/lib/storage';
import { WeekData } from '@/lib/types';
import { MessageCircle, RotateCcw, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { GuideModal } from '@/components/GuideModal';

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [tokenRefresh, setTokenRefresh] = useState(0);
  const [showTokenLog, setShowTokenLog] = useState(false);
  const [weekData, setWeekData] = useState<WeekData>(() => getWeekData(getWeekKey(0)));

  const handleDataChange = useCallback(() => {
    setWeekData(getWeekData(getWeekKey(0)));
    setTokenRefresh((n) => n + 1);
  }, []);

  const handleReset = () => {
    if (!confirm('모든 데이터를 초기화할까요?')) return;
    clearAllData();
    setWeekData({ goals: [], tasks: {} });
    setTokenRefresh((n) => n + 1);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto max-w-sm min-h-screen flex flex-col bg-background shadow-sm">
        <header className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
          <div>
            <h1 className="font-semibold text-base">학습 플래너</h1>
            <p className="text-[10px] text-muted-foreground">{getWeekKey(0)} 주차</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setGuideOpen(true)}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 space-y-5">
          {/* 주간 목표 */}
          <section>
            <p className="text-xs font-medium text-muted-foreground mb-2">이번 주 목표</p>
            <WeeklyGoals onDataChange={handleDataChange} />
          </section>

          <Separator />

          {/* 일별 계획 */}
          <section>
            <p className="text-xs font-medium text-muted-foreground mb-2">일별 계획</p>
            <DailyPlan onDataChange={handleDataChange} />
          </section>

          <Separator />

          {/* 토큰 로그 (접기/펼치기) */}
          <section>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground mb-2"
              onClick={() => setShowTokenLog((v) => !v)}
            >
              <span>토큰 로그</span>
              {showTokenLog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showTokenLog && <TokenLogView refreshKey={tokenRefresh} />}
          </section>
        </main>

        <div className="fixed bottom-6 right-4">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ChatBot open={chatOpen} onOpenChange={setChatOpen} weekData={weekData} />
      <GuideModal open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}
