'use client';

import { useEffect, useState } from 'react';
import { Goal, WeekData } from '@/lib/types';
import { getWeekKey, getWeekData, saveWeekData } from '@/lib/storage';
import { AutoSuggestInput } from './AutoSuggestInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  onDataChange: () => void;
}

export function WeeklyGoals({ onDataChange }: Props) {
  const [weekData, setWeekData] = useState<WeekData>({ goals: [], tasks: {} });
  const weekKey = getWeekKey(0);

  useEffect(() => {
    setWeekData(getWeekData(weekKey));
  }, [weekKey]);

  const save = (data: WeekData) => {
    setWeekData(data);
    saveWeekData(weekKey, data);
    onDataChange();
  };

  const addGoal = (text: string) => {
    if (weekData.goals.length >= 1) return;
    const goal: Goal = { id: Date.now().toString(), text, completed: false };
    save({ ...weekData, goals: [goal] });
  };

  const toggleGoal = (id: string) => {
    save({
      ...weekData,
      goals: weekData.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
    });
  };

  const deleteGoal = (id: string) => {
    save({ ...weekData, goals: weekData.goals.filter((g) => g.id !== id) });
  };

  const hasGoal = weekData.goals.length >= 1;

  return (
    <div className="space-y-3">
      {!hasGoal && (
        <AutoSuggestInput
          placeholder="이번 주 목표를 입력하세요..."
          type="goal"
          onSubmit={addGoal}
          showSubmitButton
        />
      )}

      {!hasGoal ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          아직 목표가 없어요. 이번 주 목표를 추가해보세요!
        </p>
      ) : (
        <ul className="space-y-2">
          {weekData.goals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <Checkbox
                checked={goal.completed}
                onCheckedChange={() => toggleGoal(goal.id)}
              />
              <span
                className={`flex-1 text-sm ${
                  goal.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {goal.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => deleteGoal(goal.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
