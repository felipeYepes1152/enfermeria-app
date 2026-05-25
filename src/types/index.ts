export interface ShiftConfig {
  id: string;
  emoji: string;
  label: string;
  startHour: number;   // 0-23
  startMinute: number; // 0 or 30
  endHour: number;
  endMinute: number;
  isSundayOrHoliday: boolean;
}

export interface CalendarEntry {
  date: string; // 'YYYY-MM-DD'
  shiftId: string;
}

export interface UserProfile {
  name: string;
  salary: number;
  shifts: ShiftConfig[];
}
