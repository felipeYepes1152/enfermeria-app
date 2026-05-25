import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateEstimatedIncome } from '../services/calculator';
import { CalendarEntry, UserProfile } from '../types';

interface Props {
  entries: CalendarEntry[];
  profile: UserProfile;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function FinancialSummary({ entries, profile }: Props) {
  const { baseSalary, nightSurcharges, sundaySurcharges, nightSundaySurcharges, totalEstimated, shiftCount } =
    calculateEstimatedIncome(entries, profile.salary, profile.shifts);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📊 Proyección Mensual</Text>
      <Text style={styles.subtitle}>{shiftCount} turno{shiftCount !== 1 ? 's' : ''} registrado{shiftCount !== 1 ? 's' : ''}</Text>

      <Row label="Salario Base" value={fmt(baseSalary)} />
      <Row label="Recargo Nocturno (35%)" value={`+ ${fmt(nightSurcharges)}`} color="#6366f1" />
      <Row label="Dom/Fest Diurno (75%)" value={`+ ${fmt(sundaySurcharges)}`} color="#f59e0b" />
      <Row label="Dom/Fest Noche (110%)" value={`+ ${fmt(nightSundaySurcharges)}`} color="#ec4899" />

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Estimado</Text>
        <Text style={styles.totalValue}>{fmt(totalEstimated)}</Text>
      </View>
    </View>
  );
}

function Row({ label, value, color = '#475569' }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 22,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: '#64748b' },
  rowValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#22c55e' },
});