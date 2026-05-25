import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Switch, Alert,
} from 'react-native';
import { UserProfile, ShiftConfig } from '../types';
import { DEFAULT_SHIFTS } from '../utils/colombiaLaw';

interface Props {
  visible: boolean;
  currentProfile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

type HourField = 'startHour' | 'startMinute' | 'endHour' | 'endMinute';

export default function SettingsModal({ visible, currentProfile, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [shifts, setShifts] = useState<ShiftConfig[]>(DEFAULT_SHIFTS);

  useEffect(() => {
    if (visible) {
      setName(currentProfile.name);
      setSalary(String(currentProfile.salary));
      setShifts(currentProfile.shifts.length > 0 ? currentProfile.shifts : DEFAULT_SHIFTS);
    }
  }, [visible]);

  const updateShiftField = (id: string, field: keyof ShiftConfig, value: any) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Falta el nombre'); return; }
    const sal = parseInt(salary, 10);
    if (isNaN(sal) || sal <= 0) { Alert.alert('Salario inválido'); return; }
    onSave({ name: name.trim(), salary: sal, shifts });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️  Configuración</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Perfil */}
          <Text style={styles.section}>Perfil</Text>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" />

          <Text style={styles.label}>Salario Base Mensual (COP)</Text>
          <TextInput
            style={styles.input}
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            placeholder="Ej: 3500000"
          />

          {/* Turnos */}
          <Text style={styles.section}>Configuración de Turnos</Text>
          <Text style={styles.hint}>
            🌙 Franja nocturna: 21:00 – 06:00 (Decreto 1072/2015, reforma 2023)
          </Text>

          {shifts.map(shift => (
            <View key={shift.id} style={styles.shiftCard}>
              <View style={styles.shiftHeader}>
                <Text style={styles.shiftEmoji}>{shift.emoji}</Text>
                <Text style={styles.shiftLabel}>{shift.label}</Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Festivo</Text>
                  <Switch
                    value={shift.isSundayOrHoliday}
                    onValueChange={v => updateShiftField(shift.id, 'isSundayOrHoliday', v)}
                    trackColor={{ true: '#f59e0b' }}
                  />
                </View>
              </View>

              <View style={styles.timeRow}>
                <TimeInput
                  label="Inicio"
                  hour={shift.startHour}
                  minute={shift.startMinute}
                  onHourChange={v => updateShiftField(shift.id, 'startHour', v)}
                  onMinuteChange={v => updateShiftField(shift.id, 'startMinute', v)}
                />
                <Text style={styles.timeSep}>→</Text>
                <TimeInput
                  label="Fin"
                  hour={shift.endHour}
                  minute={shift.endMinute}
                  onHourChange={v => updateShiftField(shift.id, 'endHour', v)}
                  onMinuteChange={v => updateShiftField(shift.id, 'endMinute', v)}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function TimeInput({ label, hour, minute, onHourChange, onMinuteChange }: {
  label: string;
  hour: number;
  minute: number;
  onHourChange: (v: number) => void;
  onMinuteChange: (v: number) => void;
}) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeInputs}>
        <TextInput
          style={styles.timeField}
          keyboardType="numeric"
          maxLength={2}
          value={String(hour).padStart(2, '0')}
          onChangeText={t => {
            const n = parseInt(t, 10);
            if (!isNaN(n) && n >= 0 && n <= 23) onHourChange(n);
          }}
        />
        <Text style={styles.timeDot}>:</Text>
        <TextInput
          style={styles.timeField}
          keyboardType="numeric"
          maxLength={2}
          value={String(minute).padStart(2, '0')}
          onChangeText={t => {
            const n = parseInt(t, 10);
            if (!isNaN(n) && (n === 0 || n === 30)) onMinuteChange(n);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  close: { fontSize: 18, color: '#94a3b8', padding: 4 },
  content: { padding: 20, paddingBottom: 60 },
  section: { fontSize: 13, fontWeight: '700', color: '#6366f1', letterSpacing: 1, textTransform: 'uppercase', marginTop: 24, marginBottom: 12 },
  label: { fontSize: 14, color: '#64748b', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 16, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  hint: { fontSize: 12, color: '#94a3b8', backgroundColor: '#f0f9ff', padding: 12, borderRadius: 10, marginBottom: 16 },
  shiftCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  shiftEmoji: { fontSize: 26, marginRight: 10 },
  shiftLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1e293b' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { fontSize: 12, color: '#94a3b8' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  timeSep: { fontSize: 18, color: '#94a3b8' },
  timeBlock: { alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 6 },
  timeInputs: { flexDirection: 'row', alignItems: 'center' },
  timeField: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, fontSize: 18, fontWeight: '700', color: '#1e293b', width: 52, textAlign: 'center' },
  timeDot: { fontSize: 20, fontWeight: '800', color: '#6366f1', marginHorizontal: 4 },
  saveBtn: { backgroundColor: '#6366f1', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});