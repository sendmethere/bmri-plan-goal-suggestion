'use client';

import { useState, useEffect } from 'react';
import { TokenLog } from '@/lib/types';
import { getTokenLogs, clearTokenLogs } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

const PRICE_INPUT = 0.150;
const PRICE_OUTPUT = 0.600;

function calcCost(input: number, output: number) {
  return (input / 1_000_000) * PRICE_INPUT + (output / 1_000_000) * PRICE_OUTPUT;
}

function formatCost(usd: number) {
  return `$${usd.toFixed(6)}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LogCard({ log, defaultExpanded = false }: { log: TokenLog; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const cost = calcCost(log.inputTokens, log.outputTokens);

  return (
    <div className="rounded-lg border p-3 text-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={log.type === 'chat' ? 'default' : 'secondary'} className="text-[10px]">
            {log.type === 'chat' ? '챗봇' : '자동제안'}
          </Badge>
          <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex gap-3 text-muted-foreground">
        <span>↑ {log.inputTokens.toLocaleString()} tk</span>
        <span>↓ {log.outputTokens.toLocaleString()} tk</span>
        <span className="text-foreground font-medium">{formatCost(cost)}</span>
      </div>

      {expanded ? (
        <div className="space-y-2 border-t pt-2 mt-1">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">보낸 내용</p>
            <pre className="whitespace-pre-wrap break-all rounded bg-muted/50 p-2 text-[10px] leading-relaxed font-mono">
              {log.userMessage}
            </pre>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">받은 내용</p>
            <pre className="whitespace-pre-wrap break-all rounded bg-muted/50 p-2 text-[10px] leading-relaxed font-mono">
              {log.assistantMessage}
            </pre>
          </div>
        </div>
      ) : (
        <>
          <p className="truncate"><span className="text-muted-foreground">Q: </span>{log.userMessage}</p>
          <p className="truncate"><span className="text-muted-foreground">A: </span>{log.assistantMessage}</p>
        </>
      )}
    </div>
  );
}

interface Props {
  refreshKey: number;
}

export function TokenLogView({ refreshKey }: Props) {
  const [logs, setLogs] = useState<TokenLog[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLogs(getTokenLogs());
  }, [refreshKey]);

  const totalInput = logs.reduce((s, l) => s + l.inputTokens, 0);
  const totalOutput = logs.reduce((s, l) => s + l.outputTokens, 0);
  const totalCost = calcCost(totalInput, totalOutput);

  const handleClear = () => {
    clearTokenLogs();
    setLogs([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            최근 {logs.length}건 &nbsp;·&nbsp; ↑ {totalInput.toLocaleString()} &nbsp;↓ {totalOutput.toLocaleString()} 토큰
          </p>
          <p className="text-xs font-medium">
            예상 비용: {formatCost(totalCost)}
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">(gpt-4o-mini 기준)</span>
          </p>
        </div>
        {logs.length > 0 && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 gap-1 text-xs">
              <Maximize2 className="h-3 w-3" />
              확대
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 gap-1 text-xs">
              <Trash2 className="h-3 w-3" />
              초기화
            </Button>
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          아직 API 호출 기록이 없어요.
        </p>
      ) : (
        <div className="h-[300px] overflow-y-auto space-y-2 pr-0.5">
          {logs.map((log) => <LogCard key={log.id} log={log} />)}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] w-[520px] max-h-[85vh] flex flex-col gap-3 p-0">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle>토큰 로그</DialogTitle>
            <p className="text-xs text-muted-foreground">
              최근 {logs.length}건 &nbsp;·&nbsp; ↑ {totalInput.toLocaleString()} &nbsp;↓ {totalOutput.toLocaleString()} 토큰 &nbsp;·&nbsp;
              <span className="font-medium text-foreground">{formatCost(totalCost)}</span>
              <span className="text-muted-foreground"> (gpt-4o-mini 기준)</span>
            </p>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
            <div className="space-y-2 pt-1">
              {logs.map((log) => <LogCard key={log.id} log={log} defaultExpanded />)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
