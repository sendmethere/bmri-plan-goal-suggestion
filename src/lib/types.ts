export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  day: number; // 0=Monday, 6=Sunday
}

export interface WeekData {
  goals: Goal[];
  tasks: Record<number, DailyTask[]>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TokenLog {
  id: string;
  timestamp: string;
  type: 'chat' | 'suggest';
  inputTokens: number;
  outputTokens: number;
  userMessage: string;
  assistantMessage: string;
}
