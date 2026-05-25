import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEntry, UserProfile, ShiftConfig } from '../types';
import { DEFAULT_SHIFTS } from '../utils/colombiaLaw';

const KEY_ENTRIES = '@turnoplus_entries_v2';
const KEY_PROFILE = '@turnoplus_profile_v2';

function mergeShifts(saved: ShiftConfig[]): ShiftConfig[] {
  return DEFAULT_SHIFTS.map(def => {
    const existing = saved.find(s => s.id === def.id);
    if (!existing) return def;
    return {
      ...existing,
      isSundayOrHoliday: def.isSundayOrHoliday,
      startHour: def.id === 'vacation' || def.id === 'po' ? def.startHour : existing.startHour,
      startMinute: def.id === 'vacation' || def.id === 'po' ? def.startMinute : existing.startMinute,
      endHour: def.id === 'vacation' || def.id === 'po' ? def.endHour : existing.endHour,
      endMinute: def.id === 'vacation' || def.id === 'po' ? def.endMinute : existing.endMinute,
      emoji: def.emoji,
      label: def.label,
    };
  });
}

export function useTurnos() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', salary: 0, shifts: DEFAULT_SHIFTS });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [e, p] = await Promise.all([
        AsyncStorage.getItem(KEY_ENTRIES),
        AsyncStorage.getItem(KEY_PROFILE),
      ]);
      if (e) setEntries(JSON.parse(e));
      if (p) {
        const saved: UserProfile = JSON.parse(p);
        const mergedShifts = mergeShifts(saved.shifts ?? []);
        const mergedProfile = { ...saved, shifts: mergedShifts };
        setProfile(mergedProfile);
        await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(mergedProfile));
      }
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(newProfile));
  };

  const saveEntry = async (date: string, shiftId: string) => {
    const filtered = entries.filter(e => e.date !== date);
    const updated = shiftId ? [...filtered, { date, shiftId }] : filtered;
    setEntries(updated);
    await AsyncStorage.setItem(KEY_ENTRIES, JSON.stringify(updated));
  };

  // NUEVA FUNCIÓN: Limpia todos los turnos del calendario
  const clearAllEntries = async () => {
    setEntries([]);
    await AsyncStorage.removeItem(KEY_ENTRIES);
  };

  // Agregamos clearAllEntries al return
  return { entries, profile, isLoading, saveEntry, updateProfile, clearAllEntries };
}