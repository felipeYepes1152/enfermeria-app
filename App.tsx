import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ShiftCalendar from './src/components/ShiftCalendar';
import ShiftPickerModal from './src/components/ShiftPickerModal';
import FinancialSummary from './src/components/FinancialSummary';
import OnboardingScreen from './src/components/OnboardingScreen';
import SettingsModal from './src/components/SettingsModal';
import { useTurnos } from './src/hooks/useTurnos';
import { UserProfile } from './src/types';

export default function App() {
  const { entries, profile, isLoading, saveEntry, updateProfile, clearAllEntries } = useTurnos();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  
  // NUEVO ESTADO: Guardamos el mes actual en formato "YYYY-MM" (por defecto el mes en curso)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  });

  if (isLoading) return null;

  if (!profile.name) {
    return (
      <OnboardingScreen
        onComplete={(p: UserProfile) => updateProfile(p)}
      />
    );
  }

  // FILTRADO: Solo tomamos los turnos cuya fecha comience con el mes seleccionado (Ej: "2026-05")
  const currentMonthEntries = entries.filter(entry => entry.date.startsWith(currentMonth));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {profile.name} 👋</Text>
            <Text style={styles.sub}>Tu proyección de este mes</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsVisible(true)}>
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ShiftCalendar
          entries={entries}
          shifts={profile.shifts}
          onDayPress={(date: string) => {
            setSelectedDate(date);
            setPickerVisible(true);
          }}
          // NUEVA PROP: Recibe el mes del calendario y actualiza el estado
          onMonthChange={(month: string) => {
            setCurrentMonth(month);
          }}
        />

        {/* PASAMOS SOLO LAS ENTRADAS DEL MES ACTUAL */}
        <FinancialSummary entries={currentMonthEntries} profile={profile} />

      </ScrollView>

      <ShiftPickerModal
        visible={isPickerVisible}
        shifts={profile.shifts}
        onClose={() => setPickerVisible(false)}
        onSelect={(shiftId: string) => {
          if (selectedDate) saveEntry(selectedDate, shiftId);
          setPickerVisible(false);
        }}
        onClearAll={() => {
          clearAllEntries();
          setPickerVisible(false);
        }}
      />

      <SettingsModal
        visible={isSettingsVisible}
        currentProfile={profile}
        onClose={() => setSettingsVisible(false)}
        onSave={(updated: UserProfile) => updateProfile(updated)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingBottom: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  sub: { color: '#64748b', fontSize: 13, marginTop: 2 },
  settingsBtn: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 14 },
});