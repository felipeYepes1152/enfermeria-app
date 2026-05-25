import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { CalendarEntry, ShiftConfig } from '../types';
import { isHolidayOrSunday } from '../utils/colombiaLaw';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['D','L','M','M','J','V','S'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

interface Props {
  entries: CalendarEntry[];
  shifts: ShiftConfig[];
  onDayPress: (date: string) => void;
  onMonthChange: (month: string) => void; // NUEVA PROP: Para enviar el mes a App.tsx
}

export default function ShiftCalendar({ entries, shifts, onDayPress, onMonthChange }: Props) {
  const entryMap = entries.reduce((acc, cur) => {
    acc[cur.date] = cur.shiftId;
    return acc;
  }, {} as Record<string, string>);

  const shiftMap = shifts.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {} as Record<string, ShiftConfig>);

  return (
    <Calendar
      style={styles.calendar}
      firstDay={0}
      // CAPTURAMOS EL CAMBIO DE MES
      onMonthChange={(monthData: { dateString: string }) => {
        // monthData.dateString viene como "YYYY-MM-DD", recortamos para que quede "YYYY-MM"
        onMonthChange(monthData.dateString.substring(0, 7));
      }}
      dayComponent={({ date, state }) => {
        if (!date) return null;
        const ds = date.dateString;
        const shiftId = entryMap[ds];
        const shift = shiftId ? shiftMap[shiftId] : undefined;
        const isToday = state === 'today';
        const isFestive = isHolidayOrSunday(ds);

        return (
          <TouchableOpacity style={styles.cell} onPress={() => onDayPress(ds)}>
            <View style={[
              styles.dayNumWrap,
              isToday && styles.todayCircle,
              isFestive && !isToday && styles.festiveCircle,
            ]}>
              <Text style={[
                styles.dayNum,
                state === 'disabled' && styles.disabled,
                isToday && styles.todayNum,
                isFestive && !isToday && styles.festiveNum,
              ]}>
                {date.day}
              </Text>
            </View>
            <View style={styles.iconWrap}>
              {shift ? <Text style={styles.emoji}>{shift.emoji}</Text> : null}
            </View>
          </TouchableOpacity>
        );
      }}
      theme={{
        calendarBackground: 'transparent',
        textSectionTitleColor: '#94a3b8',
        textMonthFontWeight: '700',
        textMonthFontSize: 16,
        monthTextColor: '#1e293b',
        arrowColor: '#6366f1',
      }}
    />
  );
}

const styles = StyleSheet.create({
  calendar: { width: '100%', paddingBottom: 10 },
  cell: { height: 62, width: 44, alignItems: 'center', paddingTop: 4 },
  dayNumWrap: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  todayCircle: { backgroundColor: '#6366f1' },
  festiveCircle: { backgroundColor: '#fef3c7' },
  dayNum: { fontSize: 13, color: '#1e293b' },
  disabled: { color: '#cbd5e1' },
  todayNum: { color: '#fff', fontWeight: '700' },
  festiveNum: { color: '#d97706', fontWeight: '600' },
  iconWrap: { height: 26, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 20 },
});