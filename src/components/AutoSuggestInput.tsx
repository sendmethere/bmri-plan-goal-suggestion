'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addTokenLog, getWeekData, getWeekKey } from '@/lib/storage';
import { WeekData } from '@/lib/types';
import { Loader2, Plus } from 'lucide-react';

interface Props {
  placeholder?: string;
  type: 'goal' | 'task';
  onSubmit: (text: string) => void;
  disabled?: boolean;
  showSubmitButton?: boolean;
  currentWeekGoal?: string;
}

export function AutoSuggestInput({ placeholder, type, onSubmit, disabled, showSubmitButton, currentWeekGoal }: Props) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFetchRef = useRef<string>('');

  const fetchSuggestions = useCallback(async (currentValue: string) => {
    const cacheKey = `${type}:${currentValue}`;
    if (cacheKey === lastFetchRef.current && suggestions.length > 0) return;
    lastFetchRef.current = cacheKey;

    const lastWeekKey = getWeekKey(-1);
    const lastWeekData: WeekData = getWeekData(lastWeekKey);

    setLoading(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentInput: currentValue, type, lastWeekData, currentWeekGoal }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setSelectedIdx(0);
      setShowSuggestions(true);

      if (data.usage) {
        addTokenLog({
          timestamp: new Date().toISOString(),
          type: 'suggest',
          inputTokens: data.usage.prompt_tokens ?? 0,
          outputTokens: data.usage.completion_tokens ?? 0,
          userMessage: `[자동제안:${type}] ${currentValue}`,
          assistantMessage: (data.suggestions ?? []).join(' / '),
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [type, suggestions.length, currentWeekGoal]);

  const scheduleOrFetch = useCallback((val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val === '') {
      fetchSuggestions('');
    } else {
      timerRef.current = setTimeout(() => fetchSuggestions(val), 3000);
    }
  }, [fetchSuggestions]);

  const acceptSuggestion = useCallback(() => {
    if (suggestions[selectedIdx]) {
      setValue(suggestions[selectedIdx]);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [suggestions, selectedIdx]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        onSubmit(value.trim());
        setValue('');
        setShowSuggestions(false);
        setSuggestions([]);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      acceptSuggestion();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Enter' && value.trim()) {
      setShowSuggestions(false);
      onSubmit(value.trim());
      setValue('');
      setSuggestions([]);
    }
  }, [showSuggestions, suggestions, acceptSuggestion, value, onSubmit]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleSubmitButton = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value);
              setShowSuggestions(false);
              scheduleOrFetch(e.target.value);
            }}
            onFocus={() => { if (value === '') fetchSuggestions(''); }}
            onKeyDown={handleKeyDown}
            className={`text-sm ${loading ? 'pr-8' : ''}`}
          />
          {loading && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        {showSubmitButton && (
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSubmitButton}
            disabled={disabled || !value.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setValue(s);
                setShowSuggestions(false);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className={`rounded px-2 py-1.5 text-left text-xs transition-colors ${
                i === selectedIdx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s}
            </button>
          ))}
          <p className="text-[10px] text-muted-foreground">
            Tab: 선택 &nbsp;·&nbsp; ←→: 변경 &nbsp;·&nbsp; Esc: 닫기
          </p>
        </div>
      )}
    </div>
  );
}
