// Ley Laboral Colombiana 2026
export const LAW_2026 = {
  NIGHT_SURCHARGE_RATE: 0.35,     // 35% recargo nocturno (Art. 168 CST)
  SUNDAY_HOLIDAY_RATE: 0.75,      // 75% recargo dominical/festivo (Art. 179 CST)
  NIGHT_START_HOUR: 21,           // 9 PM (21:00) — desde 2023 la franja nocturna es 9PM-6AM
  NIGHT_END_HOUR: 6,              // 6 AM
  MONTHLY_HOURS: 240,
};

// Festivos Colombia 2025-2026 (Ley Emiliani)
export const COLOMBIA_HOLIDAYS: string[] = [
  // 2025
  '2025-01-01','2025-01-06','2025-03-24','2025-04-17','2025-04-18',
  '2025-05-01','2025-06-02','2025-06-23','2025-06-30','2025-07-20',
  '2025-08-07','2025-08-18','2025-10-13','2025-11-03','2025-11-17',
  '2025-12-08','2025-12-25',
  // 2026
  '2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03',
  '2026-05-01','2026-05-18','2026-06-08','2026-06-15','2026-07-20',
  '2026-08-07','2026-08-17','2026-10-12','2026-11-02','2026-11-16',
  '2026-12-08','2026-12-25',
];

export function isHolidayOrSunday(dateString: string): boolean {
  const date = new Date(dateString + 'T12:00:00');
  const isSunday = date.getDay() === 0;
  const isHoliday = COLOMBIA_HOLIDAYS.includes(dateString);
  return isSunday || isHoliday;
}

/**
 * Calcula horas nocturnas (21:00 - 06:00) para un turno dado.
 */
export function calculateNightHours(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number
): number {
  const NIGHT_START = 21 * 60; // 21:00 en minutos
  const NIGHT_END = 6 * 60;    // 06:00 en minutos

  const startMins = startHour * 60 + startMinute;
  let endMins = endHour * 60 + endMinute;

  // Si el turno termina en el día siguiente (cruce de medianoche)
  if (endMins <= startMins) {
    endMins += 24 * 60;
  }

  const totalDuration = endMins - startMins;
  let nightMinutes = 0;

  // Iteramos minuto a minuto no, sino calculamos intervalos de solapamiento
  // Intervalo nocturno 1: 21:00 - 24:00 (1260 - 1440)
  // Intervalo nocturno 2: 00:00 - 06:00 (1440 - 1800 en escala extendida / 0 - 360 real)

  const nightSegments = [
    { from: NIGHT_START, to: 24 * 60 },           // 21:00 - 24:00
    { from: 24 * 60, to: 24 * 60 + NIGHT_END },    // 00:00 - 06:00 (en escala +24h)
  ];

  for (const seg of nightSegments) {
    const overlapStart = Math.max(startMins, seg.from);
    const overlapEnd = Math.min(endMins, seg.to);
    if (overlapEnd > overlapStart) {
      nightMinutes += overlapEnd - overlapStart;
    }
  }

  return parseFloat((nightMinutes / 60).toFixed(2));
}

export const DEFAULT_SHIFTS: import('../types').ShiftConfig[] = [
  {
    id: 'day',
    emoji: '☀️',
    label: 'Día',
    startHour: 7,
    startMinute: 0,
    endHour: 19,
    endMinute: 0,
    isSundayOrHoliday: false,
  },
  {
    id: 'night',
    emoji: '🌙',
    label: 'Noche',
    startHour: 19,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    isSundayOrHoliday: false,
  },
  {
    // Posturno: descanso compensatorio después de turno nocturno. Sin recargos.
    id: 'po',
    emoji: 'PO',
    label: 'Posturno',
    startHour: 0,
    startMinute: 0,
    endHour: 0,
    endMinute: 0,
    isSundayOrHoliday: false,
  },
  {
    // Vacaciones: no genera recargos.
    id: 'vacation',
    emoji: '🌴',
    label: 'Vacaciones',
    startHour: 0,
    startMinute: 0,
    endHour: 0,
    endMinute: 0,
    isSundayOrHoliday: false,
  },
];