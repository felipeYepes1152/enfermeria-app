import { LAW_2026, calculateNightHours, isHolidayOrSunday } from '../utils/colombiaLaw';
import { CalendarEntry, ShiftConfig } from '../types';

export interface IncomeBreakdown {
  baseSalary: number;
  nightSurcharges: number;
  sundaySurcharges: number;
  nightSundaySurcharges: number;
  totalEstimated: number;
  shiftCount: number;
}

export function calculateEstimatedIncome(
  entries: CalendarEntry[],
  baseSalary: number,
  shifts: ShiftConfig[]
): IncomeBreakdown {
  const hourlyRate = baseSalary / LAW_2026.MONTHLY_HOURS;
  let nightSurcharges = 0;
  let sundaySurcharges = 0;
  let nightSundaySurcharges = 0;

  entries.forEach(entry => {
    const shift = shifts.find(s => s.id === entry.shiftId);
    if (!shift) return;

    // PO (posturno) y Vacaciones tienen 0 horas — no generan recargos
    const totalHours = getTotalHours(shift);
    if (totalHours === 0) return;

    const dateIsSundayOrHoliday = isHolidayOrSunday(entry.date);
    const nightHours = calculateNightHours(
      shift.startHour,
      shift.startMinute,
      shift.endHour,
      shift.endMinute
    );
    const dayHours = totalHours - nightHours;

    // Recargo nocturno
    if (nightHours > 0) {
      nightSurcharges += hourlyRate * LAW_2026.NIGHT_SURCHARGE_RATE * nightHours;
    }

    // Recargo dominical/festivo
    const isFestive = shift.isSundayOrHoliday || dateIsSundayOrHoliday;
    if (isFestive) {
      if (dayHours > 0) {
        sundaySurcharges += hourlyRate * LAW_2026.SUNDAY_HOLIDAY_RATE * dayHours;
      }
      if (nightHours > 0) {
        // Acumulado noche + festivo (110%)
        nightSundaySurcharges +=
          hourlyRate * (LAW_2026.NIGHT_SURCHARGE_RATE + LAW_2026.SUNDAY_HOLIDAY_RATE) * nightHours;
        // Quitamos lo que ya contamos en nightSurcharges para no duplicar
        nightSurcharges -= hourlyRate * LAW_2026.NIGHT_SURCHARGE_RATE * nightHours;
      }
    }
  });

  const total = baseSalary + nightSurcharges + sundaySurcharges + nightSundaySurcharges;

  return {
    baseSalary,
    nightSurcharges: Math.round(nightSurcharges),
    sundaySurcharges: Math.round(sundaySurcharges),
    nightSundaySurcharges: Math.round(nightSundaySurcharges),
    totalEstimated: Math.round(total),
    shiftCount: entries.length,
  };
}

function getTotalHours(shift: ShiftConfig): number {
  let startMins = shift.startHour * 60 + shift.startMinute;
  let endMins = shift.endHour * 60 + shift.endMinute;
  if (endMins <= startMins) endMins += 24 * 60;
  const hours = (endMins - startMins) / 60;
  // Si start == end == 0 (PO/Vacaciones), el resultado sería 24h — retornamos 0
  return (shift.startHour === 0 && shift.endHour === 0 &&
          shift.startMinute === 0 && shift.endMinute === 0) ? 0 : hours;
}