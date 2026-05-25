import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import { ShiftConfig } from '../types';

interface Props {
  visible: boolean;
  shifts: ShiftConfig[];
  onClose: () => void;
  onSelect: (shiftId: string) => void;
  onClearAll: () => void; // NUEVA PROP
}

function formatTime(h: number, m: number) {
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export default function ShiftPickerModal({ visible, shifts, onClose, onSelect, onClearAll }: Props) {
  
  // Función para manejar la alerta de seguridad
  const handleClearAll = () => {
    Alert.alert(
      "Limpiar calendario",
      "¿Estás segura de que deseas borrar todos los turnos registrados? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar todo", 
          style: "destructive", 
          onPress: () => {
            onClearAll();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>Asignar Turno</Text>
              {shifts.map(shift => (
                <TouchableOpacity
                  key={shift.id}
                  style={styles.row}
                  onPress={() => onSelect(shift.id)}
                >
                  <Text style={styles.emoji}>{shift.emoji}</Text>
                  <View style={styles.info}>
                    <Text style={styles.label}>{shift.label}</Text>
                    <Text style={styles.time}>
                      {formatTime(shift.startHour, shift.startMinute)} – {formatTime(shift.endHour, shift.endMinute)}
                      {shift.isSundayOrHoliday ? '  🏅 Festivo' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity style={styles.clearBtn} onPress={() => onSelect('')}>
                <Text style={styles.clearText}>🗑  Limpiar día</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
                <Text style={styles.clearAllText}>⚠️ Limpiar todo el calendario</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 44 },
  handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  emoji: { fontSize: 32, width: 50, textAlign: 'center' },
  info: { flex: 1, marginLeft: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  time: { fontSize: 13, color: '#64748b', marginTop: 2 },
  clearBtn: { marginTop: 18, padding: 15, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }, // Lo cambié a un gris suave para diferenciarlo
  clearText: { color: '#64748b', fontWeight: '700', fontSize: 16 },
  clearAllBtn: { marginTop: 10, padding: 15, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center' }, // Botón rojo pálido
  clearAllText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});