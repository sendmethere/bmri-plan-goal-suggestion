'use client';

import { useEffect, useState } from 'react';
import { DailyTask, WeekData } from '@/lib/types';
import { getWeekKey, getWeekData, saveWeekData } from '@/lib/storage';
import { AutoSuggestInput } from './AutoSuggestInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, LayoutList, AlignJustify } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금'];

function getTodayIndex(): number {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (day === 0 || day === 6) return 0;
  return day - 1;
}

interface Props {
  onDataChange: () => void;
  currentWeekGoal?: string;
}

export function DailyPlan({ onDataChange, currentWeekGoal }: Props) {
  const [weekData, setWeekData] = useState<WeekData>({ goals: [], tasks: {} });
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const weekKey = getWeekKey(0);

  useEffect(() => {
    setWeekData(getWeekData(weekKey));
  }, [weekKey]);

  const save = (data: WeekData) => {
    setWeekData(data);
    saveWeekData(weekKey, data);
    onDataChange();
  };

  const addTask = (text: string, day: number) => {
    const dayTasks = weekData.tasks[day] ?? [];
    const task: DailyTask = { id: Date.now().toString(), text, completed: false, day };
    save({ ...weekData, tasks: { ...weekData.tasks, [day]: [...dayTasks, task] } });
  };

  const toggleTask = (id: string, day: number) => {
    const dayTasks = (weekData.tasks[day] ?? []).map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    save({ ...weekData, tasks: { ...weekData.tasks, [day]: dayTasks } });
  };

  const deleteTask = (id: string, day: number) => {
    const dayTasks = (weekData.tasks[day] ?? []).filter((t) => t.id !== id);
    save({ ...weekData, tasks: { ...weekData.tasks, [day]: dayTasks } });
  };

  const renderDayContent = (day: number) => {
    const tasks = weekData.tasks[day] ?? [];
    return (
      <div className="space-y-2">
        <AutoSuggestInput
          placeholder={`${DAYS[day]}요일 계획을 입력하세요...`}
          type="task"
          onSubmit={(text) => addTask(text, day)}
          currentWeekGoal={currentWeekGoal}
          selectedDay={day}
        />
        {tasks.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">계획을 추가해보세요!</p>
        ) : (
          <ul className="space-y-1.5">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id, day)}
                />
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => deleteTask(task.id, day)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {viewMode === 'day' ? (
          <div className="flex flex-1 gap-1">
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
        ) : (
          <div className="flex-1" />
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          title={viewMode === 'day' ? '주간보기' : '일별보기'}
          onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}
        >
          {viewMode === 'day' ? (
            <AlignJustify className="h-3.5 w-3.5" />
          ) : (
            <LayoutList className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {viewMode === 'day' ? (
        renderDayContent(selectedDay)
      ) : (
        <div className="space-y-5">
          {DAYS.map((d, i) => (
            <div key={d}>
              <p className="text-xs font-semibold mb-2">
                {d}요일
                <span className="ml-1.5 text-muted-foreground font-normal">
                  ({(weekData.tasks[i] ?? []).length}개)
                </span>
              </p>
              {renderDayContent(i)}
              {i < DAYS.length - 1 && <div className="mt-5 border-b" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
