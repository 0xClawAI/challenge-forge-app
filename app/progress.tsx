import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useChallengeStore } from '../src/stores/challengeStore';
import { getToday, getDayNum, getDayKey } from '../src/utils/date';
import { isDayDone, getDayLog, getStreak, getCompletedDays, getStatus, isTaskDone } from '../src/utils/challenge';
import { ProgressRing } from '../src/components/ProgressRing';
import { TYPE_COLORS, TASK_ICONS } from '../src/theme/colors';

export default function ProgressScreen() {
  const { primary, accent, colors } = useTheme();
  const { challenges, activeId, dayResetHour } = useChallengeStore();
  const ch = challenges.find(c => c.id === activeId);

  if (!ch) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
        <View style={[styles.empty, { backgroundColor: primary.bg }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
          <Text style={[styles.h2, { color: primary.t1 }]}>No active challenge</Text>
          <Text style={[styles.sub, { color: primary.t2 }]}>Start a challenge to see progress</Text>
        </View>
      </SafeAreaView>
    );
  }

  const todayStr = getToday(dayResetHour);
  const dn = getDayNum(ch.startDate, ch.duration, todayStr);
  const streak = getStreak(ch, dayResetHour);
  const completed = getCompletedDays(ch, Math.min(dn, ch.duration));
  const pct = Math.round((completed / ch.duration) * 100);
  const bigCirc = Math.PI * 124;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
      <ScrollView style={styles.view} contentContainerStyle={styles.content}>
        <Text style={[styles.h1, { color: primary.t1 }]}>{ch.name}</Text>
        <Text style={[styles.sub, { color: primary.t2 }]}>Day {dn} of {ch.duration}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>STREAK</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{pct}%</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>COMPLETE</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{ch.resets || 0}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>RESETS</Text>
          </View>
        </View>

        {/* Big ring */}
        <View style={styles.ringWrap}>
          <ProgressRing size={160} strokeWidth={8} progress={pct} label={`${completed}/${ch.duration}`} />
        </View>

        {/* Day Grid */}
        <Text style={[styles.h3, { color: primary.t1 }]}>Day Grid</Text>
        <View style={styles.dayGrid}>
          {Array.from({ length: ch.duration }, (_, i) => {
            const d = i + 1;
            const dk = getDayKey(ch.startDate, d);
            const isToday = dk === todayStr;
            const done = isDayDone(ch, dk);
            const isPast = d < dn;
            const dayLog = getDayLog(ch, dk);
            const isLate = dayLog.caughtUp;
            const isFailed = dayLog.failed;

            let bg = 'rgba(255,255,255,0.04)';
            let textColor = primary.t3;
            if (isToday && !isFailed) { bg = accent.accent; textColor = '#fff'; }
            else if (done && isLate) { bg = colors.ok; textColor = '#fff'; }
            else if (done) { bg = colors.ok; textColor = '#fff'; }
            else if (isFailed || isPast) { bg = 'rgba(239,68,68,0.7)'; textColor = '#fff'; }

            return (
              <View key={d} style={[styles.dayCell, { backgroundColor: bg }]}>
                <Text style={[styles.dayCellText, { color: textColor }]}>{d}</Text>
              </View>
            );
          })}
        </View>

        {/* Task breakdown */}
        <Text style={[styles.h3, { color: primary.t1, marginTop: 24 }]}>Task Breakdown</Text>
        {ch.tasks.map((t, i) => {
          let comp = 0;
          for (let d = 1; d <= Math.min(dn, ch.duration); d++) {
            const dk = getDayKey(ch.startDate, d);
            const log = getDayLog(ch, dk);
            if (isTaskDone(t, log.tasks[i] || {})) comp++;
          }
          const taskPct = dn > 0 ? Math.round((comp / Math.min(dn, ch.duration)) * 100) : 0;
          const tColor = TYPE_COLORS[t.type] || accent.accent;

          return (
            <View key={i} style={[styles.taskBreakdown, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
              <View style={styles.taskBreakdownHeader}>
                <Text style={{ fontSize: 20 }}>{t.icon || TASK_ICONS[t.type]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskBName, { color: primary.t1 }]}>{t.name}</Text>
                  <Text style={[styles.taskBDetail, { color: primary.t2 }]}>{comp}/{Math.min(dn, ch.duration)} days · {taskPct}%</Text>
                </View>
              </View>
              <View style={[styles.taskBar, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <View style={[styles.taskBarFill, { width: `${taskPct}%` as any, backgroundColor: tColor }]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  sub: { fontSize: 14, color: '#8B8BA0', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  stat: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },
  ringWrap: { alignItems: 'center', marginVertical: 28 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginVertical: 16 },
  dayCell: { width: 38, aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayCellText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  taskBreakdown: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  taskBreakdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskBName: { fontWeight: '600', fontSize: 14 },
  taskBDetail: { fontSize: 12, marginTop: 2 },
  taskBar: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  taskBarFill: { height: '100%', borderRadius: 2 },
});
