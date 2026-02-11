import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated,
} from 'react-native';
import * as Haptics from '../utils/haptics';
import { useTheme } from '../theme/ThemeContext';
import { Challenge, DayLog } from '../types';
import { getDayKey, getDayNum, getToday } from '../utils/date';
import { getDayLog, isDayDone } from '../utils/challenge';

interface Props {
  challenge: Challenge;
  dayResetHour: number;
  onComplete: (actions: Record<string, 'failed' | 'late'>) => void;
  onDismiss: () => void;
}

export function CatchUpModal({ challenge, dayResetHour, onComplete, onDismiss }: Props) {
  const { primary, accent, colors } = useTheme();
  const todayStr = getToday(dayResetHour);
  const dn = getDayNum(challenge.startDate, challenge.duration, todayStr);

  // Find missed days (past days that are not done and not already caught up/failed)
  const missedDays = useMemo(() => {
    const missed: number[] = [];
    for (let d = 1; d < dn; d++) {
      const dk = getDayKey(challenge.startDate, d);
      const log = getDayLog(challenge, dk);
      if (!isDayDone(challenge, dk) && !log.failed && !log.caughtUp) {
        missed.push(d);
      }
    }
    return missed;
  }, [challenge, dn]);

  const [actions, setActions] = useState<Record<string, 'failed' | 'late'>>({});
  const [confirmingDay, setConfirmingDay] = useState<number | null>(null);
  const [mode, setMode] = useState<'single' | 'bulk' | 'review'>( 
    missedDays.length >= 3 ? 'bulk' : 'single'
  );
  const [currentIdx, setCurrentIdx] = useState(0);

  if (missedDays.length === 0) return null;

  const currentDay = missedDays[currentIdx];
  const allActioned = missedDays.every(d => actions[d] !== undefined);

  const handleFail = useCallback((day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActions(a => ({ ...a, [day]: 'failed' }));
    // Auto-advance
    const nextIdx = missedDays.findIndex((d, i) => i > currentIdx && !actions[d]);
    if (nextIdx >= 0) setCurrentIdx(nextIdx);
  }, [missedDays, currentIdx, actions]);

  const handleLate = useCallback((day: number) => {
    setConfirmingDay(day);
  }, []);

  const confirmLate = useCallback((day: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActions(a => ({ ...a, [day]: 'late' }));
    setConfirmingDay(null);
    const nextIdx = missedDays.findIndex((d, i) => i > currentIdx && !actions[d]);
    if (nextIdx >= 0) setCurrentIdx(nextIdx);
  }, [missedDays, currentIdx, actions]);

  const handleBulkFail = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const newActions: Record<string, 'failed' | 'late'> = {};
    missedDays.forEach(d => { newActions[d] = 'failed'; });
    setActions(newActions);
  }, [missedDays]);

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Fill in any unactioned as failed
    const final = { ...actions };
    missedDays.forEach(d => { if (!final[d]) final[d] = 'failed'; });
    onComplete(final);
  }, [actions, missedDays, onComplete]);

  // Single/double missed: per-day modal
  const renderSingleDay = (day: number) => {
    const actioned = actions[day];
    return (
      <View key={day}>
        <View style={[styles.dayBadge, { backgroundColor: accent.accent + '18' }]}>
          <Text style={[styles.dayBadgeText, { color: accent.accentL }]}>Day {day}</Text>
        </View>

        {confirmingDay === day ? (
          <View style={[styles.confirmBox, { backgroundColor: primary.bgE, borderColor: primary.border }]}>
            <Text style={[styles.confirmText, { color: primary.t2 }]}>
              🤝 Honor system — did you truly complete all tasks for Day {day}?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.06)', flex: 1 }]}
                onPress={() => setConfirmingDay(null)}
              >
                <Text style={[styles.actionBtnText, { color: primary.t2 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.ok, flex: 1 }]}
                onPress={() => confirmLate(day)}
              >
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Yes, I Did It</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : actioned ? (
          <View style={[styles.actionedBadge, { backgroundColor: actioned === 'late' ? colors.ok + '14' : colors.err + '14' }]}>
            <Text style={{ color: actioned === 'late' ? colors.ok : colors.err, fontWeight: '600' }}>
              {actioned === 'late' ? '✅ Completed (late)' : '❌ Marked as failed'}
            </Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.err + '0F', borderColor: colors.err + '1F', borderWidth: 1, flex: 1 }]}
              onPress={() => handleFail(day)}
            >
              <Text style={[styles.actionBtnText, { color: colors.err }]}>😤 I Failed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.ok + '0F', borderColor: colors.ok + '1F', borderWidth: 1, flex: 1 }]}
              onPress={() => handleLate(day)}
            >
              <Text style={[styles.actionBtnText, { color: colors.ok }]}>✅ I Completed It</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: primary.bgS, borderColor: primary.borderA }]}>
          <View style={[styles.handle, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />

          <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 16 }}>
            {missedDays.length >= 3 ? '📅' : '⏰'}
          </Text>
          <Text style={[styles.title, { color: primary.t1 }]}>
            {missedDays.length === 1 ? 'You missed a day' : `You missed ${missedDays.length} days`}
          </Text>
          <Text style={[styles.subtitle, { color: primary.t2 }]}>
            {missedDays.length >= 3
              ? "Let's catch up on what you missed."
              : "What happened? Be honest with yourself."}
          </Text>

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {mode === 'bulk' && missedDays.length >= 3 ? (
              <View>
                {/* Bulk options */}
                <TouchableOpacity
                  style={[styles.bulkBtn, { backgroundColor: colors.err + '0F', borderColor: colors.err + '1F' }]}
                  onPress={handleBulkFail}
                >
                  <Text style={[styles.bulkBtnText, { color: colors.err }]}>😤 I Failed All {missedDays.length} Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bulkBtn, { backgroundColor: accent.accent + '0F', borderColor: accent.accent + '1F' }]}
                  onPress={() => setMode('review')}
                >
                  <Text style={[styles.bulkBtnText, { color: accent.accentL }]}>📋 Review One by One</Text>
                </TouchableOpacity>

                {/* Show if any actioned */}
                {Object.keys(actions).length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    {missedDays.map(d => {
                      const a = actions[d];
                      if (!a) return null;
                      return (
                        <View key={d} style={[styles.missedItem, { backgroundColor: primary.bgE, borderColor: primary.border }]}>
                          <Text style={[styles.missedDayNum, { color: accent.accentL }]}>Day {d}</Text>
                          <Text style={{ color: a === 'late' ? colors.ok : colors.err, fontWeight: '600', fontSize: 13 }}>
                            {a === 'late' ? '✅ Late' : '❌ Failed'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : mode === 'review' ? (
              missedDays.map(d => renderSingleDay(d))
            ) : (
              missedDays.map(d => renderSingleDay(d))
            )}
          </ScrollView>

          <View style={{ marginTop: 20, gap: 10 }}>
            {allActioned && (
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: accent.accent }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitBtnText}>Continue →</Text>
              </TouchableOpacity>
            )}
            {!allActioned && Object.keys(actions).length > 0 && (
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: accent.accent }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitBtnText}>Done — Mark Rest as Failed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onDismiss}>
              <Text style={[styles.dismissText, { color: primary.t3 }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  dayBadge: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, marginBottom: 16 },
  dayBadgeText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontWeight: '600', fontSize: 14 },

  confirmBox: { borderRadius: 14, padding: 20, borderWidth: 1, marginBottom: 16 },
  confirmText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },

  actionedBadge: { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },

  bulkBtn: { height: 52, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  bulkBtnText: { fontWeight: '600', fontSize: 14 },

  missedItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  missedDayNum: { fontWeight: '700', minWidth: 52 },

  submitBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dismissText: { textAlign: 'center', padding: 10, fontSize: 13 },
});
