'use client';

import { useState, useEffect } from 'react';
import { TokenLog } from '@/lib/types';
import { getTokenLogs, clearTokenLogs } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Maximize2 } from 'lucide-react';

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
      {/* 요약 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            총 {logs.length}건 &nbsp;·&nbsp; ↑ {totalInput.toLocaleString()} &nbsp;↓ {totalOutput.toLocaleString()} 토큰
          </p>
          <p className="text-xs font-medium">
            예상 비용: {formatCost(totalCost)}
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">(gpt-4o-mini 기준)</span>
          </p>
        </div>
        <div className="flex gap-1">
          {logs.length > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 gap-1 text-xs">
                <Maximize2 className="h-3 w-3" />
                확대
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 gap-1 text-xs">
                <Trash2 className="h-3 w-3" />
                초기화
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 카드 리스트 (미리보기) */}
      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          아직 API 호출 기록이 없어요.
        </p>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {logs.map((log) => {
              const cost = calcCost(log.inputTokens, log.outputTokens);
              return (
                <div key={log.id} className="rounded-lg border p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant={log.type === 'chat' ? 'default' : 'secondary'} className="text-[10px]">
                      {log.type === 'chat' ? '챗봇' : '자동제안'}
                    </Badge>
                    <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
                  </div>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>↑ {log.inputTokens} tk</span>
                    <span>↓ {log.outputTokens} tk</span>
                    <span className="text-foreground font-medium">{formatCost(cost)}</span>
                  </div>
                  <p className="truncate"><span className="text-muted-foreground">Q: </span>{log.userMessage}</p>
                  <p className="truncate"><span className="text-muted-foreground">A: </span>{log.assistantMessage}</p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* 확대 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[95vw] w-[900px] max-h-[85vh] flex flex-col gap-3 p-0"
          showCloseButton
        >
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle>토큰 로그</DialogTitle>
            <p className="text-xs text-muted-foreground">
              총 {logs.length}건 &nbsp;·&nbsp; ↑ {totalInput.toLocaleString()} &nbsp;↓ {totalOutput.toLocaleString()} 토큰 &nbsp;·&nbsp;
              <span className="font-medium text-foreground">{formatCost(totalCost)}</span>
              <span className="text-muted-foreground"> (gpt-4o-mini 기준)</span>
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 px-5 pb-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">시간</TableHead>
                  <TableHead className="w-[72px]">유형</TableHead>
                  <TableHead className="w-[72px] text-right">입력 tk</TableHead>
                  <TableHead className="w-[72px] text-right">출력 tk</TableHead>
                  <TableHead className="w-[90px] text-right">예상 비용</TableHead>
                  <TableHead>보낸 메시지</TableHead>
                  <TableHead>받은 메시지</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">{formatTime(log.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant={log.type === 'chat' ? 'default' : 'secondary'} className="text-[10px]">
                        {log.type === 'chat' ? '챗봇' : '자동제안'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">{log.inputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right">{log.outputTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      {formatCost(calcCost(log.inputTokens, log.outputTokens))}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      <p className="truncate">{log.userMessage}</p>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      <p className="truncate">{log.assistantMessage}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
