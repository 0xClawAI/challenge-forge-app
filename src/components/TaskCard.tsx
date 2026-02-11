import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Task, TaskLog } from '../types';
import { TYPE_COLORS, TASK_ICONS } from '../theme/colors';
import { formatTime } from '../utils/date';
import { isTaskDone } from '../utils/challenge';

interface Props {
  task: Task;
  taskLog: TaskLog;
  index: number;
  onUpdate: (update: Partial<TaskLog>) => void;
}

export function TaskCard({ task, taskLog, index, onUpdate }: Props) {
  const { primary, accent, colors } = useTheme();
  const tl = taskLog || {};
  const done = isTaskDone(task, tl);
  const typeColor = TYPE_COLORS[task.type] || accent.accent;

  // Timer state
  const [timerDisplay, setTimerDisplay] = useState(tl.elapsed || 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (tl.running && tl.startedAt) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - (tl.startedAt || 0)) / 1000);
        setTimerDisplay(elapsed);
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      setTimerDisplay(tl.elapsed || 0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [tl.running, tl.startedAt, tl.elapsed]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpdate({ done: !tl.done });
  }, [tl.done, onUpdate]);

  const handleCounter = useCallback((dir: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({ count: Math.max(0, (tl.count || 0) + dir) });
  }, [tl.count, onUpdate]);

  const handleWater = useCallback((oz: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({ oz: Math.max(0, (tl.oz || 0) + oz) });
  }, [tl.oz, onUpdate]);

  const handleMulti = useCallback((opt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const selected = [...(tl.selected || [])];
    const idx = selected.indexOf(opt);
    if (idx >= 0) selected.splice(idx, 1);
    else selected.push(opt);
    onUpdate({ selected });
  }, [tl.selected, onUpdate]);

  const handleTimerToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (tl.running) {
      onUpdate({ running: false, elapsed: timerDisplay });
    } else {
      onUpdate({ running: true, startedAt: Date.now() - (tl.elapsed || 0) * 1000 });
    }
  }, [tl.running, tl.elapsed, timerDisplay, onUpdate]);

  const handleTimerReset = useCallback(() => {
    onUpdate({ running: false, elapsed: 0, startedAt: undefined });
    setTimerDisplay(0);
  }, [onUpdate]);

  const detail = getDetail(task, tl, timerDisplay);

  return (
    <Pressable
      onPress={task.type === 'checkbox' ? handleToggle : undefined}
      style={[
        styles.container,
        {
          backgroundColor: primary.bgS,
          borderColor: done ? `${colors.ok}40` : primary.border,
          borderLeftColor: done ? colors.ok : primary.border,
          borderLeftWidth: done ? 3 : 1,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: typeColor + '14' }]}>
          <Text style={{ fontSize: 18 }}>{task.icon || TASK_ICONS[task.type]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: primary.t1 }]}>{task.name}</Text>
          <Text style={[styles.detail, { color: primary.t2 }]}>{detail}</Text>
        </View>
        {task.type === 'checkbox' && (
          <TouchableOpacity
            onPress={handleToggle}
            style={[
              styles.checkbox,
              done && { backgroundColor: colors.ok, borderColor: colors.ok },
              !done && { borderColor: 'rgba(255,255,255,0.12)' },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {done && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Input area */}
      {renderInput(task, tl, timerDisplay, {
        primary, accent, colors,
        handleCounter, handleWater, handleMulti,
        handleTimerToggle, handleTimerReset,
        onUpdate,
      })}
    </Pressable>
  );
}

function getDetail(t: Task, tl: TaskLog, timerElapsed: number): string {
  switch (t.type) {
    case 'checkbox': return tl.done ? 'Done' : 'Tap to complete';
    case 'counter': return `${tl.count || 0} ${t.config?.unit || 'times'}`;
    case 'value': return `${tl.value != null ? tl.value : '—'} / ${t.config?.target || 0} ${t.config?.unit || ''}`;
    case 'water': return `${tl.oz || 0} / ${t.config?.targetOz || 64} oz`;
    case 'multi': {
      const sel = tl.selected?.length || 0;
      const total = t.config?.options?.length || 1;
      return `${sel}/${total} complete`;
    }
    case 'timer': return `${formatTime(timerElapsed)}${t.config?.targetSec ? ' / ' + formatTime(t.config.targetSec) : ''}`;
    case 'photo': return tl.photo ? '📸 Captured' : 'Take photo';
    case 'journal': return tl.text ? tl.text.slice(0, 40) + '...' : 'Write something';
    default: return '';
  }
}

function renderInput(task: Task, tl: TaskLog, timerDisplay: number, ctx: any) {
  const { primary, accent, colors, handleCounter, handleWater, handleMulti, handleTimerToggle, handleTimerReset, onUpdate } = ctx;

  switch (task.type) {
    case 'checkbox':
      return null;

    case 'counter':
      return (
        <View style={styles.counterWrap}>
          <TouchableOpacity
            onPress={() => handleCounter(-1)}
            style={[styles.counterBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
          >
            <Text style={[styles.counterBtnText, { color: colors.err }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.counterVal, { color: primary.t1 }]}>{tl.count || 0}</Text>
          <TouchableOpacity
            onPress={() => handleCounter(1)}
            style={[styles.counterBtn, { backgroundColor: accent.accent + '1A' }]}
          >
            <Text style={[styles.counterBtnText, { color: accent.accentL }]}>+</Text>
          </TouchableOpacity>
        </View>
      );

    case 'value':
      return (
        <View style={styles.valueWrap}>
          <TextInput
            style={[styles.valueInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={primary.t3}
            value={tl.value != null ? String(tl.value) : ''}
            onChangeText={(text) => {
              const v = text ? parseFloat(text) : null;
              onUpdate({ value: v });
            }}
          />
          <Text style={[styles.valueTarget, { color: primary.t2 }]}>
            / {task.config?.target || 0} {task.config?.unit || ''}
          </Text>
        </View>
      );

    case 'water': {
      const oz = tl.oz || 0;
      const target = task.config?.targetOz || 64;
      const pct = Math.min(100, Math.round((oz / target) * 100));
      return (
        <View style={styles.waterWrap}>
          <View style={[styles.waterBar, { backgroundColor: 'rgba(59,130,246,0.10)' }]}>
            <View style={[styles.waterFill, { width: `${pct}%` as any }]} />
            <Text style={styles.waterLabel}>{oz}oz</Text>
          </View>
          <View style={styles.waterBtns}>
            {[
              { label: '−8oz', val: -8, disabled: oz <= 0 },
              { label: '+8oz', val: 8 },
              { label: '+16oz', val: 16 },
              { label: '+32oz', val: 32 },
            ].map((btn) => (
              <TouchableOpacity
                key={btn.label}
                onPress={() => handleWater(btn.val)}
                disabled={btn.disabled}
                style={[
                  styles.waterBtn,
                  btn.val < 0 && { backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.15)' },
                  btn.disabled && { opacity: 0.3 },
                ]}
              >
                <Text style={[styles.waterBtnText, btn.val < 0 && { color: colors.err }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    case 'multi': {
      const opts = task.config?.options || [];
      const sel = tl.selected || [];
      return (
        <View style={styles.multiWrap}>
          {opts.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => handleMulti(opt)}
              style={[
                styles.multiOpt,
                { borderColor: primary.border },
                sel.includes(opt) && { backgroundColor: accent.accent + '26', borderColor: accent.accent },
              ]}
            >
              <Text style={[styles.multiOptText, { color: sel.includes(opt) ? '#fff' : primary.t2 }]}>
                {sel.includes(opt) ? '✓ ' : ''}{opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    case 'timer':
      return (
        <View style={styles.timerWrap}>
          <Text style={[
            styles.timerDisplay,
            { color: tl.running ? colors.ok : primary.t1 },
          ]}>
            {formatTime(timerDisplay)}
          </Text>
          <View style={styles.timerBtns}>
            <TouchableOpacity
              onPress={handleTimerToggle}
              style={[
                styles.timerBtn,
                { backgroundColor: tl.running ? colors.warn : colors.ok },
              ]}
            >
              <Text style={[styles.timerBtnText, { color: tl.running ? '#111' : '#fff' }]}>
                {tl.running ? 'Pause' : (tl.elapsed ? 'Resume' : 'Start')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTimerReset}
              style={[styles.timerBtn, { backgroundColor: 'rgba(255,255,255,0.06)' }]}
            >
              <Text style={[styles.timerBtnText, { color: primary.t2 }]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case 'journal':
      return (
        <View style={styles.journalWrap}>
          <TextInput
            style={[styles.journalInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
            multiline
            placeholder="Write your thoughts..."
            placeholderTextColor={primary.t3}
            value={tl.text || ''}
            onChangeText={(text) => onUpdate({ text })}
            textAlignVertical="top"
          />
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 15 },
  detail: { fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Counter
  counterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 14,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { fontSize: 22, fontWeight: '700' },
  counterVal: { fontSize: 36, fontWeight: '800', minWidth: 60, textAlign: 'center', fontVariant: ['tabular-nums'] },

  // Value
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  valueInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    fontVariant: ['tabular-nums'],
  },
  valueTarget: { fontSize: 14 },

  // Water
  waterWrap: { marginTop: 12 },
  waterBar: {
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  waterFill: {
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  waterLabel: {
    position: 'absolute',
    right: 10,
    fontSize: 11,
    fontWeight: '600',
    color: '#8B8BA0',
  },
  waterBtns: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  waterBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterBtnText: { fontWeight: '600', fontSize: 13, color: '#60A5FA' },

  // Multi
  multiWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  multiOpt: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  multiOptText: { fontWeight: '500', fontSize: 13 },

  // Timer
  timerWrap: { marginTop: 14, alignItems: 'center' },
  timerDisplay: { fontSize: 48, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: 2 },
  timerBtns: { flexDirection: 'row', gap: 8, marginTop: 14 },
  timerBtn: { height: 44, paddingHorizontal: 24, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timerBtnText: { fontWeight: '600', fontSize: 14 },

  // Journal
  journalWrap: { marginTop: 12 },
  journalInput: {
    minHeight: 80,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 14,
    lineHeight: 22,
  },
});
