import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import { UserProfile } from '../types';
import { DEFAULT_SHIFTS } from '../utils/colombiaLaw';

const { width } = Dimensions.get('window');

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const canContinue = name.trim().length > 0 && Number(salary) > 0;

  const handleComplete = () => {
    if (!canContinue) return;
    onComplete({ name: name.trim(), salary: Number(salary), shifts: DEFAULT_SHIFTS });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background blobs */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <View style={styles.inner}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏥</Text>
          </View>
          <Text style={styles.appName}>TurnoPlus</Text>
          <Text style={styles.appTagline}>Proyección de ingresos para enfermería</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>¿Cómo te llamas?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Wendy"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Salario base mensual (COP)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 3.500.000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={salary}
              onChangeText={t => setSalary(t.replace(/\D/g, ''))}
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, !canContinue && styles.btnDisabled]}
            onPress={handleComplete}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Comenzar ahora  →</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            📋 Los turnos se configuran automáticamente según la{'\n'}ley laboral colombiana 2026.
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  blobTop: { width: 300, height: 300, backgroundColor: '#6366f1', top: -100, right: -60 },
  blobBottom: { width: 240, height: 240, backgroundColor: '#8b5cf6', bottom: -80, left: -60 },

  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },

  logoWrap: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: '#1e293b',
    borderWidth: 2, borderColor: '#6366f1',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20,
  },
  logoEmoji: { fontSize: 42 },
  appName: { fontSize: 36, fontWeight: '900', color: '#f8fafc', letterSpacing: -1 },
  appTagline: { fontSize: 14, color: '#64748b', marginTop: 6, textAlign: 'center' },

  form: {},
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#a5b4fc', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 14, padding: 16,
    fontSize: 17, color: '#f8fafc',
    borderWidth: 1.5, borderColor: '#334155',
  },
  btn: {
    backgroundColor: '#6366f1',
    borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14,
  },
  btnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  footerNote: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 24, lineHeight: 18 },
});