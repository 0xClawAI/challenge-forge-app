import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useChallengeStore } from '../src/stores/challengeStore';
import { ACCENT_THEMES, PRIMARY_THEMES } from '../src/theme/colors';

export default function SettingsScreen() {
  const { primary, accent, colors } = useTheme();
  const { theme, primaryTheme, setTheme, setPrimaryTheme } = useSettingsStore();
  const { resetAllData } = useChallengeStore();

  const handleReset = () => {
    Alert.alert('Delete ALL data?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Really sure?', '', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes, delete everything', style: 'destructive', onPress: resetAllData },
          ]);
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
      <ScrollView style={styles.view} contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: primary.t1 }]}>Settings</Text>
        <Text style={[styles.sub, { color: primary.t2, marginBottom: 24 }]}>App preferences</Text>

        {/* Theme */}
        <View style={[styles.card, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
          <Text style={[styles.h3, { color: primary.t1 }]}>🎨 Theme</Text>

          <Text style={[styles.cap, { color: primary.t2, marginTop: 16 }]}>BACKGROUND</Text>
          <View style={styles.primaryGrid}>
            {Object.entries(PRIMARY_THEMES).map(([key, pt]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.primaryCard,
                  { backgroundColor: pt.bgS, borderColor: primaryTheme === key ? accent.accent : pt.border },
                  primaryTheme === key && { borderWidth: 2 },
                ]}
                onPress={() => setPrimaryTheme(key as any)}
              >
                <View style={[styles.primaryPreview, { backgroundColor: pt.bg }]}>
                  <View style={[styles.previewBar, { backgroundColor: accent.accent }]} />
                  <View style={[styles.previewCard, { backgroundColor: pt.bgE, borderColor: pt.border }]} />
                </View>
                <Text style={[styles.primaryName, { color: pt.t1 }]}>{pt.name}</Text>
                {primaryTheme === key && (
                  <View style={[styles.checkBadge, { backgroundColor: accent.accent }]}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.cap, { color: primary.t2, marginTop: 20 }]}>ACCENT COLOR</Text>
          <View style={styles.accentGrid}>
            {Object.entries(ACCENT_THEMES).map(([key, at]) => (
              <TouchableOpacity
                key={key}
                style={styles.accentOption}
                onPress={() => setTheme(key)}
              >
                <View style={[
                  styles.accentCircle,
                  { backgroundColor: at.accent },
                  theme === key && { borderColor: at.accentL, borderWidth: 3, shadowColor: at.accent, shadowOpacity: 0.4, shadowRadius: 8 },
                ]}>
                  {theme === key && <Text style={styles.accentCheck}>✓</Text>}
                </View>
                <Text style={[styles.accentLabel, { color: primary.t2 }]}>{at.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data */}
        <View style={[styles.card, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
          <TouchableOpacity style={styles.cfgRow} onPress={handleReset}>
            <View>
              <Text style={[styles.cfgLabel, { color: colors.err }]}>Reset All Data</Text>
              <Text style={[styles.cfgDesc, { color: primary.t2 }]}>Delete everything</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🔥</Text>
          <Text style={[styles.footerText, { color: primary.t3 }]}>Challenge Forge v1.0{'\n'}Forged with discipline</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  h3: { fontSize: 17, fontWeight: '600' },
  sub: { fontSize: 14, marginTop: 4 },
  cap: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  card: { borderRadius: 14, padding: 20, marginBottom: 20, borderWidth: 1 },

  // Primary themes
  primaryGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  primaryCard: { width: '22%' as any, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: 'center', position: 'relative' },
  primaryPreview: { width: '100%', height: 48, borderRadius: 10, marginBottom: 10, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(128,128,128,0.15)' },
  previewBar: { height: 8, borderRadius: 2, position: 'absolute', left: 8, right: 8, top: 6 },
  previewCard: { position: 'absolute', left: 6, right: 6, height: 16, borderRadius: 3, bottom: 6, borderWidth: 1 },
  primaryName: { fontSize: 12, fontWeight: '700' },
  checkBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  checkBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Accent colors
  accentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  accentOption: { alignItems: 'center', gap: 6, width: '18%' as any },
  accentCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 0 },
  accentCheck: { color: '#fff', fontWeight: '700', fontSize: 14 },
  accentLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

  // Config
  cfgRow: { paddingVertical: 4 },
  cfgLabel: { fontSize: 14, fontWeight: '500' },
  cfgDesc: { fontSize: 12, marginTop: 2 },

  footer: { alignItems: 'center', marginTop: 48 },
  footerText: { textAlign: 'center', fontSize: 12, lineHeight: 18 },
});
