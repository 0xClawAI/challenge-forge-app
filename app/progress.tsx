import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { useChallengeStore } from '../src/stores/challengeStore';
import { getToday, getDayNum, getDayKey } from '../src/utils/date';
import { isDayDone, getDayLog, getStreak, getCompletedDays, getStatus, isTaskDone } from '../src/utils/challenge';
import { ProgressRing } from '../src/components/ProgressRing';
import { TYPE_COLORS, TASK_ICONS } from '../src/theme/colors';
import { PhotoViewer } from '../src/components/PhotoViewer';

export default function ProgressScreen() {
  const { primary, accent, colors } = useTheme();
  const { challenges, activeId, dayResetHour } = useChallengeStore();
  const ch = challenges.find(c => c.id === activeId);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

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

  const screenWidth = Dimensions.get('window').width;
  const gridPadding = 20 * 2;
  const gap = 6;
  const cols = 7;
  const cellSize = Math.floor((screenWidth - gridPadding - gap * (cols - 1)) / cols);

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
        <View style={[styles.dayGrid, { gap }]}>
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
              <TouchableOpacity
                key={d}
                style={[styles.dayCell, { backgroundColor: bg, width: cellSize, height: cellSize }]}
                onPress={() => (isPast || isToday) ? setSelectedDay(d) : null}
                activeOpacity={isPast || isToday ? 0.6 : 1}
              >
                <Text style={[styles.dayCellText, { color: textColor }]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Day Detail Modal */}
        {selectedDay !== null && (() => {
          const dk = getDayKey(ch.startDate, selectedDay);
          const dayLog = getDayLog(ch, dk);
          const done = isDayDone(ch, dk);
          const dateObj = new Date(dk);
          const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

          return (
            <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedDay(null)}>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={[styles.modalTitle, { color: primary.t1 }]}>Day {selectedDay}</Text>
                      <Text style={[styles.modalDate, { color: primary.t2 }]}>{dateStr}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedDay(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text style={{ fontSize: 24, color: primary.t3 }}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.modalStatus, { backgroundColor: done ? colors.ok + '14' : 'rgba(239,68,68,0.08)', borderColor: done ? colors.ok + '33' : 'rgba(239,68,68,0.2)' }]}>
                    <Text style={{ fontSize: 18 }}>{done ? '✅' : dayLog.failed ? '❌' : dayLog.caughtUp ? '⏰' : '⚠️'}</Text>
                    <Text style={[styles.modalStatusText, { color: done ? colors.ok : colors.err }]}>
                      {done ? (dayLog.caughtUp ? 'Completed (Late)' : 'Completed') : dayLog.failed ? 'Failed' : 'Incomplete'}
                    </Text>
                  </View>

                  <ScrollView style={{ maxHeight: 400 }}>
                    {ch.tasks.map((task, i) => {
                      const tl = dayLog.tasks[i] || {};
                      const taskDone = isTaskDone(task, tl);
                      return (
                        <View key={i} style={[styles.modalTask, { borderColor: primary.border, borderLeftColor: taskDone ? colors.ok : primary.border, borderLeftWidth: 3 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text style={{ fontSize: 16 }}>{task.icon || TASK_ICONS[task.type]}</Text>
                            <Text style={[styles.modalTaskName, { color: primary.t1 }]}>{task.name}</Text>
                            <Text style={{ fontSize: 14 }}>{taskDone ? '✅' : '—'}</Text>
                          </View>
                          {task.type === 'water' && <Text style={{ color: primary.t2, fontSize: 13 }}>{tl.oz || 0} / {task.config?.targetOz || 64} oz</Text>}
                          {task.type === 'timer' && <Text style={{ color: primary.t2, fontSize: 13 }}>{Math.floor((tl.elapsed || 0) / 60)} / {Math.floor((task.config?.targetSec || 0) / 60)} min</Text>}
                          {task.type === 'value' && tl.value != null && <Text style={{ color: primary.t2, fontSize: 13 }}>{tl.value} {task.config?.unit || ''} (target: {task.config?.target})</Text>}
                          {task.type === 'counter' && <Text style={{ color: primary.t2, fontSize: 13 }}>{tl.count || 0} {task.config?.unit || 'times'}</Text>}
                          {task.type === 'multi' && <Text style={{ color: primary.t2, fontSize: 13 }}>{(tl.selected || []).join(', ') || 'None'}</Text>}
                          {task.type === 'journal' && tl.text && <Text style={{ color: primary.t2, fontSize: 13, fontStyle: 'italic' }} numberOfLines={3}>{tl.text}</Text>}
                          {task.type === 'photo' && tl.photo && (
                            <TouchableOpacity onPress={() => setViewingPhoto(tl.photo!)} activeOpacity={0.8}>
                              <Image source={{ uri: tl.photo }} style={{ width: '100%', height: 160, borderRadius: 8, marginTop: 6 }} resizeMode="cover" />
                              <Text style={{ color: accent.accentL, fontSize: 12, marginTop: 4, textAlign: 'center' }}>Tap to view full screen</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>

                  <TouchableOpacity style={[styles.modalClose, { backgroundColor: accent.accent }]} onPress={() => setSelectedDay(null)}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          );
        })()}

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
      <PhotoViewer
        uri={viewingPhoto || ''}
        visible={!!viewingPhoto}
        onClose={() => setViewingPhoto(null)}
        primary={primary}
        accent={accent}
      />
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
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 16 },
  dayCell: { borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayCellText: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  // Day detail modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderBottomWidth: 0, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: '800' },
  modalDate: { fontSize: 14, marginTop: 2 },
  modalStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  modalStatusText: { fontWeight: '600', fontSize: 14 },
  modalTask: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  modalTaskName: { fontWeight: '600', fontSize: 14, flex: 1 },
  modalClose: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  taskBreakdown: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  taskBreakdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskBName: { fontWeight: '600', fontSize: 14 },
  taskBDetail: { fontSize: 12, marginTop: 2 },
  taskBar: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  taskBarFill: { height: '100%', borderRadius: 2 },
});
