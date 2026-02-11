import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useChallengeStore } from '../src/stores/challengeStore';
import { getStatus, getCompletedDays, getStreak } from '../src/utils/challenge';
import { getDayNum, getToday, getDayKey } from '../src/utils/date';

export default function HistoryScreen() {
  const { primary, accent, colors } = useTheme();
  const { challenges, setActiveId, dayResetHour } = useChallengeStore();
  const chs = [...challenges].reverse();
  const todayStr = getToday(dayResetHour);
  const completed = chs.filter(c => getStatus(c, dayResetHour) === 'completed').length;
  const totalDays = chs.reduce((s, c) => s + getCompletedDays(c, Math.min(getDayNum(c.startDate, c.duration, todayStr), c.duration)), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
      <ScrollView style={styles.view} contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: primary.t1 }]}>History</Text>
        <Text style={[styles.sub, { color: primary.t2 }]}>Your challenge journey</Text>

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{chs.length}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>CHALLENGES</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{completed}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>COMPLETED</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{totalDays}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>TOTAL DAYS</Text>
          </View>
        </View>

        {chs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📜</Text>
            <Text style={[styles.h2, { color: primary.t1 }]}>No challenges yet</Text>
            <Text style={[styles.sub, { color: primary.t2 }]}>Create your first challenge!</Text>
          </View>
        ) : (
          chs.map(c => {
            const st = getStatus(c, dayResetHour);
            const dn = getDayNum(c.startDate, c.duration, todayStr);
            const cd = getCompletedDays(c, Math.min(dn, c.duration));
            const icon = st === 'completed' ? '🏆' : st === 'failed' ? '💀' : st === 'ended' ? '🏁' : '⚡';
            const statusText = st === 'completed' ? '✅ Completed' :
              st === 'failed' ? `❌ Failed Day ${c.endedDay || dn}` :
              st === 'ended' ? `🏁 Ended Day ${c.endedDay || dn}` : `⚡ Active — Day ${dn}`;
            const borderColor = st === 'completed' ? colors.ok : st === 'failed' ? colors.err : st === 'ended' ? colors.warn : accent.accent;

            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.card, { backgroundColor: primary.bgS, borderColor: primary.border, borderLeftColor: borderColor, borderLeftWidth: 3 }]}
                onPress={() => { setActiveId(c.id); }}
              >
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: primary.t1 }]}>{c.name}</Text>
                    <Text style={[styles.cardMeta, { color: primary.t2 }]}>{c.duration} days · {cd} completed · Started {c.startDate}</Text>
                    <Text style={[styles.cardStatus, { color: borderColor }]}>{statusText}</Text>
                  </View>
                  <Text style={{ fontSize: 28 }}>{icon}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  h2: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 20 },
  stat: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 40 },
  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontWeight: '700', fontSize: 15 },
  cardMeta: { fontSize: 13, marginTop: 2 },
  cardStatus: { fontSize: 12, marginTop: 4 },
});
