import { WeekData, TokenLog } from './types';

const PREFIX = 'bmri_';

export function getWeekKey(offset = 0): string {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const year = monday.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((monday.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  );
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

function emptyWeek(): WeekData {
  return { goals: [], tasks: {} };
}

export function getWeekData(key: string): WeekData {
  if (typeof window === 'undefined') return emptyWeek();
  const raw = localStorage.getItem(`${PREFIX}week_${key}`);
  return raw ? JSON.parse(raw) : emptyWeek();
}

export function saveWeekData(key: string, data: WeekData): void {
  localStorage.setItem(`${PREFIX}week_${key}`, JSON.stringify(data));
}

export function getTokenLogs(): TokenLog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(`${PREFIX}token_logs`);
  return raw ? JSON.parse(raw) : [];
}

export function addTokenLog(log: Omit<TokenLog, 'id'>): void {
  const logs = getTokenLogs();
  logs.unshift({ ...log, id: Date.now().toString() });
  localStorage.setItem(`${PREFIX}token_logs`, JSON.stringify(logs.slice(0, 200)));
}

export function clearTokenLogs(): void {
  localStorage.removeItem(`${PREFIX}token_logs`);
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
