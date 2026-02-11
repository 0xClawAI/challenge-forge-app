import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme/ThemeContext';
import { useChallengeStore } from '../src/stores/challengeStore';
import { TEMPLATES } from '../src/data/templates';

export default function CreateScreen() {
  const { primary, accent, colors } = useTheme();
  const router = useRouter();
  const { createChallenge } = useChallengeStore();

  const handleUseTemplate = (idx: number) => {
    const t = TEMPLATES[idx];
    createChallenge(t.name, t.duration, t.tasks, t.strictness);
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
      <ScrollView style={styles.view} contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: primary.t1 }]}>New Challenge</Text>
        <Text style={[styles.sub, { color: primary.t2, marginBottom: 24 }]}>Pick a template to get started quickly</Text>

        {TEMPLATES.map((t, i) => {
          const moodColors: Record<string, string> = { '75 Hard': '#EF4444', '75 Medium': '#F59E0B', '75 Soft': '#10B981' };
          const mood = moodColors[t.name] || accent.accent;

          return (
            <TouchableOpacity
              key={i}
              style={[styles.tplCard, { backgroundColor: primary.bgS, borderColor: primary.border, borderTopColor: mood, borderTopWidth: 3 }]}
              onPress={() => handleUseTemplate(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tplName, { color: primary.t1 }]}>{t.name}</Text>
              <Text style={[styles.tplMeta, { color: primary.t2 }]}>{t.duration} days · {t.tasks.length} tasks</Text>
              <Text style={[styles.tplDesc, { color: primary.t2 }]}>{t.desc}</Text>
              <View style={styles.tplTags}>
                {t.tags.map(tag => (
                  <View key={tag} style={[styles.tplTag, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                    <Text style={[styles.tplTagText, { color: primary.t2 }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.hint, { color: primary.t3, marginTop: 24 }]}>
          Full wizard with custom tasks coming soon ✨
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  sub: { fontSize: 14, marginTop: 4 },
  tplCard: { borderRadius: 14, padding: 20, marginBottom: 12, borderWidth: 1 },
  tplName: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  tplMeta: { fontSize: 13 },
  tplDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  tplTags: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  tplTag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  tplTagText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  hint: { textAlign: 'center', fontSize: 13 },
});
