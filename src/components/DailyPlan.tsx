'use client';

import { useEffect, useState } from 'react';
import { DailyTask, WeekData } from '@/lib/types';
import { getWeekKey, getWeekData, saveWeekData } from '@/lib/storage';
import { AutoSuggestInput } from './AutoSuggestInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

function getTodayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

interface Props {
  onDataChange: () => void;
  currentWeekGoal?: string;
}

export function DailyPlan({ onDataChange, currentWeekGoal }: Props) {
  const [weekData, setWeekData] = useState<WeekData>({ goals: [], tasks: {} });
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const weekKey = getWeekKey(0);

  useEffect(() => {
    setWeekData(getWeekData(weekKey));
  }, [weekKey]);

  const save = (data: WeekData) => {
    setWeekData(data);
    saveWeekData(weekKey, data);
    onDataChange();
  };

  const tasks: DailyTask[] = weekData.tasks[selectedDay] ?? [];

  const addTask = (text: string) => {
    const task: DailyTask = { id: Date.now().toString(), text, completed: false, day: selectedDay };
    const updated = { ...weekData.tasks, [selectedDay]: [...tasks, task] };
    save({ ...weekData, tasks: updated });
  };

  const toggleTask = (id: string) => {
    const updated = {
      ...weekData.tasks,
      [selectedDay]: tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    };
    save({ ...weekData, tasks: updated });
  };

  const deleteTask = (id: string) => {
    const updated = {
      ...weekData.tasks,
      [selectedDay]: tasks.filter((t) => t.id !== id),
    };
    save({ ...weekData, tasks: updated });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setSelectedDay(i)}
            className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
              selectedDay === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <AutoSuggestInput
        placeholder={`${DAYS[selectedDay]}요일 계획을 입력하세요...`}
        type="task"
        onSubmit={addTask}
        currentWeekGoal={currentWeekGoal}
        selectedDay={selectedDay}
      />

      {tasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {DAYS[selectedDay]}요일 계획을 추가해보세요!
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <span
                className={`flex-1 text-sm ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => deleteTask(task.id)}
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
