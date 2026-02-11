import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/theme/ThemeContext';
import { useChallengeStore } from '../src/stores/challengeStore';
import { ProgressRing } from '../src/components/ProgressRing';
import { TaskCard } from '../src/components/TaskCard';
import { Confetti } from '../src/components/Confetti';
import { CatchUpModal } from '../src/components/CatchUpModal';
import { showToast } from '../src/components/Toast';
import { getToday, getDayNum, getDayKey } from '../src/utils/date';
import { getDayLog, isTaskDone, isDayDone, getStatus, getStreak } from '../src/utils/challenge';
import { TaskLog } from '../src/types';
import { QUOTES, TEMPLATES } from '../src/data/templates';

const MOOD_COLORS: Record<string, string> = {
  '75 Hard': '#EF4444', '75 Medium': '#F59E0B', '75 Soft': '#10B981',
};

function HomeScreen() {
  const { primary, accent, colors } = useTheme();
  const router = useRouter();
  const { challenges, activeId, setActiveId } = useChallengeStore();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const featuredTemplates = TEMPLATES.slice(0, 3);

  return (
    <ScrollView style={[styles.view, { backgroundColor: primary.bg }]} contentContainerStyle={styles.viewContent}>
      <View style={styles.hero}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🔥</Text>
        <Text style={[styles.display, { color: primary.t1 }]}>Challenge{'\n'}Forge</Text>
        <Text style={[styles.tagline, { color: primary.t2 }]}>
          Build your challenge. Set your rules.{'\n'}Forge your discipline.
        </Text>
        <TouchableOpacity
          style={[styles.btnP, { backgroundColor: accent.accent }]}
          onPress={() => router.push('/create')}
        >
          <Text style={styles.btnPText}>+ Create Challenge</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Challenges */}
      <Text style={[styles.cap, { color: primary.t2, marginBottom: 10, marginTop: 8 }]}>🔥 POPULAR CHALLENGES</Text>
      {featuredTemplates.map((t, i) => {
        const mood = MOOD_COLORS[t.name] || accent.accent;
        return (
          <TouchableOpacity
            key={i}
            style={[styles.featuredCard, { backgroundColor: primary.bgS, borderColor: primary.border, borderLeftColor: mood, borderLeftWidth: 3 }]}
            onPress={() => router.push('/create')}
            activeOpacity={0.7}
          >
            <View style={[styles.fcIcon, { backgroundColor: mood + '18' }]}>
              <Text style={{ fontSize: 22 }}>{t.tasks[0]?.icon || '🔥'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fcName, { color: primary.t1 }]}>{t.name}</Text>
              <Text style={[styles.fcMeta, { color: primary.t2 }]}>
                {t.duration} days · {t.tasks.length} tasks · {t.strictness.failureMode === 'restart' ? 'Hardcore' : 'Flexible'}
              </Text>
            </View>
            <Text style={{ color: primary.t3, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        );
      })}

      {/* Quote */}
      <View style={[styles.quoteCard, { backgroundColor: accent.accent + '0F', borderColor: accent.accent + '1A' }]}>
        <Text style={[styles.quoteText, { color: primary.t1 }]}>"{quote.text}"</Text>
        <Text style={[styles.quoteAuthor, { color: primary.t3 }]}>— {quote.author}</Text>
      </View>

      {/* Past challenges */}
      {challenges.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <Text style={[styles.cap, { color: primary.t2, marginBottom: 12 }]}>PAST CHALLENGES</Text>
          {[...challenges].reverse().map(c => {
            const st = getStatus(c, 0);
            const stIcon = st === 'completed' ? '🏆' : st === 'failed' ? '💀' : st === 'ended' ? '🏁' : '⚡';
            const stLabel = st === 'completed' ? '✅ Completed' :
              st === 'failed' ? `❌ Failed` :
              st === 'ended' ? `🏁 Ended` : '⚡ Active';
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.pastCard, { backgroundColor: primary.bgS, borderColor: primary.border }]}
                onPress={() => setActiveId(c.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fcName, { color: primary.t1 }]}>{c.name}</Text>
                  <Text style={[styles.fcMeta, { color: primary.t2 }]}>{c.duration} days · {stLabel}</Text>
                </View>
                <Text style={{ fontSize: 28 }}>{stIcon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function DailyScreen({ challengeId }: { challengeId: string }) {
  const { primary, accent, colors } = useTheme();
  const router = useRouter();
  const { challenges, dayResetHour, updateTaskLog, failChallenge, endChallenge, setActiveId, updateDayLog } = useChallengeStore();
  const ch = challenges.find(c => c.id === challengeId)!;
  const todayStr = getToday(dayResetHour);
  const dn = getDayNum(ch.startDate, ch.duration, todayStr);
  const status = getStatus(ch, dayResetHour);
  const dayLog = getDayLog(ch, todayStr);
  const doneCount = ch.tasks.filter((t, i) => isTaskDone(t, dayLog.tasks[i])).length;
  const pct = ch.tasks.length ? Math.round((doneCount / ch.tasks.length) * 100) : 0;
  const allDone = isDayDone(ch, todayStr);
  const streak = getStreak(ch, dayResetHour);
  const quote = useMemo(() => QUOTES[dn % QUOTES.length], [dn]);

  // Confetti trigger
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [wasAllDone, setWasAllDone] = useState(allDone);

  // Catch-up modal
  const [showCatchUp, setShowCatchUp] = useState(false);
  const [catchUpChecked, setCatchUpChecked] = useState(false);

  // Check for missed days on mount
  useEffect(() => {
    if (status !== 'active' || catchUpChecked) return;
    setCatchUpChecked(true);
    // Check if there are missed incomplete days
    let missed = 0;
    for (let d = 1; d < dn; d++) {
      const dk = getDayKey(ch.startDate, d);
      const log = getDayLog(ch, dk);
      if (!isDayDone(ch, dk) && !log.failed && !log.caughtUp) {
        missed++;
      }
    }
    if (missed > 0) setShowCatchUp(true);
  }, [status, dn, ch, catchUpChecked]);

  // Confetti on completion
  useEffect(() => {
    if (allDone && !wasAllDone) {
      setConfettiTrigger(t => t + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('🎉 Day ' + dn + ' Complete!');
    }
    setWasAllDone(allDone);
  }, [allDone, wasAllDone, dn]);

  const handleTaskUpdate = useCallback((idx: number, update: Partial<TaskLog>) => {
    updateTaskLog(challengeId, todayStr, idx, update);
  }, [challengeId, todayStr, updateTaskLog]);

  const handleFail = useCallback(() => {
    Alert.alert(
      '😤 End Challenge?',
      `End "${ch.name}" as failed on Day ${dn}?\n\nYour progress will be saved in History.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'I Failed', style: 'destructive', onPress: () => {
          failChallenge(ch.id);
          showToast('Challenge ended. Your progress is saved.');
        }},
      ]
    );
  }, [ch, dn, failChallenge]);

  const handleEnd = useCallback(() => {
    Alert.alert(
      '🏁 End Challenge?',
      `End "${ch.name}" on Day ${dn} of ${ch.duration}?\n\nThis challenge will move to History.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', onPress: () => {
          endChallenge(ch.id);
          showToast('Challenge ended.');
        }},
      ]
    );
  }, [ch, dn, endChallenge]);

  const handleCatchUpComplete = useCallback((actions: Record<string, 'failed' | 'late'>) => {
    // Process catch-up actions
    for (const [dayStr, action] of Object.entries(actions)) {
      const day = parseInt(dayStr);
      const dk = getDayKey(ch.startDate, day);
      if (action === 'failed') {
        updateDayLog(challengeId, dk, { failed: true });
      } else if (action === 'late') {
        updateDayLog(challengeId, dk, { caughtUp: true, caughtUpDate: todayStr });
        // Mark all tasks as done for that day
        ch.tasks.forEach((_, i) => {
          updateTaskLog(challengeId, dk, i, { done: true, late: true });
        });
      }
    }
    setShowCatchUp(false);
    showToast('Caught up! Keep going 💪');
  }, [ch, challengeId, todayStr, updateTaskLog, updateDayLog]);

  // Ended states
  if (status === 'completed' || status === 'failed' || status === 'ended') {
    const icon = status === 'completed' ? '🏆' : status === 'failed' ? '💀' : '🏁';
    const title = status === 'completed' ? 'Challenge Complete!' : status === 'failed' ? 'Challenge Failed' : 'Challenge Ended';
    const titleColor = status === 'completed' ? colors.ok : status === 'failed' ? colors.err : colors.warn;
    return (
      <ScrollView style={[styles.view, { backgroundColor: primary.bg }]} contentContainerStyle={styles.viewContent}>
        <View style={styles.endedHero}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>{icon}</Text>
          <Text style={[styles.endedTitle, { color: titleColor }]}>{title}</Text>
          <Text style={[styles.tagline, { color: primary.t2 }]}>
            {ch.name} — {status === 'failed' ? 'Failed' : status === 'ended' ? 'Ended' : 'Completed'} on Day {ch.endedDay || dn} of {ch.duration}
          </Text>
          <TouchableOpacity style={[styles.btnP, { backgroundColor: accent.accent, marginTop: 24 }]} onPress={() => router.push('/create')}>
            <Text style={styles.btnPText}>New Challenge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnS, { borderColor: primary.border, marginTop: 8 }]} onPress={() => setActiveId(null)}>
            <Text style={[styles.btnSText, { color: primary.t1 }]}>Home</Text>
          </TouchableOpacity>
        </View>
        {status === 'completed' && <Confetti trigger={1} />}
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView style={[styles.view, { backgroundColor: primary.bg }]} contentContainerStyle={styles.viewContent}>
        {/* Header */}
        <View style={styles.dailyHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.h1, { color: primary.t1, flex: 1 }]}>{ch.name}</Text>
              <TouchableOpacity
                style={[styles.editIcon, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: primary.border }]}
                onPress={() => router.push('/create')}
              >
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.sub, { color: primary.t2 }]}>
              Day <Text style={{ color: accent.accentL, fontWeight: '700' }}>{dn}</Text> of {ch.duration} · {ch.duration - dn} left
            </Text>
          </View>
          <ProgressRing size={56} strokeWidth={5} progress={pct} label={`${pct}%`} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: allDone ? colors.ok : accent.accent }]} />
        </View>

        {/* Day complete banner */}
        {allDone && (
          <View style={[styles.dayBanner, { backgroundColor: colors.ok + '14', borderColor: colors.ok + '33' }]}>
            <Text style={{ fontSize: 20, marginRight: 6 }}>🎉</Text>
            <Text style={[styles.dayBannerText, { color: colors.ok }]}>Day {dn} Complete!</Text>
          </View>
        )}

        {/* Tasks */}
        {ch.tasks.map((task, i) => (
          <TaskCard
            key={i}
            task={task}
            taskLog={dayLog.tasks[i] || {}}
            index={i}
            onUpdate={(update) => handleTaskUpdate(i, update)}
          />
        ))}

        {/* Quote on completion */}
        {allDone && (
          <View style={[styles.quoteCard, { backgroundColor: accent.accent + '0F', borderColor: accent.accent + '1A' }]}>
            <Text style={[styles.quoteText, { color: primary.t1 }]}>"{quote.text}"</Text>
            <Text style={[styles.quoteAuthor, { color: primary.t3 }]}>— {quote.author}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>STREAK</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{Math.round((dn / ch.duration) * 100)}%</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>PROGRESS</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
            <Text style={[styles.statVal, { color: accent.accentL }]}>{ch.duration - dn}</Text>
            <Text style={[styles.statLabel, { color: primary.t2 }]}>DAYS LEFT</Text>
          </View>
        </View>

        {/* Fail / End buttons */}
        {!allDone && (
          <TouchableOpacity style={[styles.failBtn, { backgroundColor: colors.err + '0F', borderColor: colors.err + '1F' }]} onPress={handleFail}>
            <Text style={[styles.failBtnText, { color: colors.err }]}>😤 I Failed Today</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={() => setActiveId(null)}>
            <Text style={[styles.linkText, { color: primary.t3 }]}>Switch Challenge</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEnd}>
            <Text style={[styles.linkText, { color: colors.warn }]}>🏁 End Challenge</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Confetti trigger={confettiTrigger} />

      {showCatchUp && (
        <CatchUpModal
          challenge={ch}
          dayResetHour={dayResetHour}
          onComplete={handleCatchUpComplete}
          onDismiss={() => setShowCatchUp(false)}
        />
      )}
    </>
  );
}

export default function TodayScreen() {
  const { primary } = useTheme();
  const { challenges, activeId } = useChallengeStore();
  const ch = challenges.find(c => c.id === activeId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
      {ch ? <DailyScreen challengeId={ch.id} /> : <HomeScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1 },
  viewContent: { padding: 20, paddingBottom: 120 },

  // Hero
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: 32 },
  display: { fontSize: 44, fontWeight: '900', letterSpacing: -2, lineHeight: 46, textAlign: 'center', marginBottom: 12 },
  tagline: { fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 280, marginBottom: 24 },

  // Buttons
  btnP: { height: 54, paddingHorizontal: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnPText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnS: { height: 54, paddingHorizontal: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', width: '100%', borderWidth: 1 },
  btnSText: { fontWeight: '600', fontSize: 15 },

  // Featured
  cap: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  featuredCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, overflow: 'hidden',
  },
  fcIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fcName: { fontWeight: '700', fontSize: 15 },
  fcMeta: { fontSize: 12, marginTop: 2 },
  pastCard: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },

  // Quote
  quoteCard: { borderRadius: 14, padding: 20, marginTop: 20, borderWidth: 1, alignItems: 'center' },
  quoteText: { fontSize: 15, fontWeight: '500', fontStyle: 'italic', lineHeight: 22, textAlign: 'center', marginBottom: 8 },
  quoteAuthor: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Daily
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8, lineHeight: 34 },
  sub: { fontSize: 14, marginTop: 4 },
  editIcon: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  progressBar: { height: 3, borderRadius: 2, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  dayBanner: { borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 16, borderWidth: 1 },
  dayBannerText: { fontWeight: '700', fontSize: 15 },

  statsRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  stat: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },

  failBtn: { width: '100%', height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24, borderWidth: 1 },
  failBtnText: { fontWeight: '600', fontSize: 14 },

  bottomActions: { alignItems: 'center', gap: 8, marginTop: 16 },
  linkText: { fontSize: 13, padding: 10 },

  endedHero: { alignItems: 'center', paddingTop: 60 },
  endedTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
});
