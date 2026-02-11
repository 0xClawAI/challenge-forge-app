import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from '../src/utils/haptics';
import { useTheme } from '../src/theme/ThemeContext';
import { useChallengeStore } from '../src/stores/challengeStore';
import { TEMPLATES } from '../src/data/templates';
import { TASK_SUGGESTIONS, TaskSuggestion } from '../src/data/suggestions';
import { Task, Strictness } from '../src/types';
import { TYPE_COLORS, TASK_ICONS } from '../src/theme/colors';
import { showToast } from '../src/components/Toast';

const DURATIONS = [30, 50, 75, 90, 100];
const NAME_SUGGESTIONS = ['Iron Mind', 'Phoenix Challenge', 'My 75 Hard', 'Transform', 'Level Up'];
const TASK_TYPES: Task['type'][] = ['checkbox', 'counter', 'value', 'water', 'multi', 'timer', 'photo', 'journal'];
const TYPE_LABELS: Record<string, string> = {
  checkbox: 'Check', counter: 'Counter', value: 'Value', water: 'Water',
  multi: 'Multi', timer: 'Timer', photo: 'Photo', journal: 'Journal',
};
const MOOD_COLORS: Record<string, string> = {
  '75 Hard': '#EF4444', '75 Medium': '#F59E0B', '75 Soft': '#10B981',
  '30 Day Reset': '#3B82F6', 'Iron Mind 90': '#7C5CFC',
};

interface WizardState {
  name: string;
  duration: number;
  customDuration: string;
  tasks: Task[];
  strictness: Strictness;
}

export default function CreateScreen() {
  const { primary, accent, colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const { createChallenge, updateChallenge, challenges } = useChallengeStore();
  const editChallenge = params.editId ? challenges.find(c => c.id === params.editId) : null;
  const isEditing = !!editChallenge;

  const [step, setStep] = useState(1);
  const [wiz, setWiz] = useState<WizardState>(() => {
    if (editChallenge) {
      return {
        name: editChallenge.name,
        duration: editChallenge.duration,
        customDuration: '',
        tasks: editChallenge.tasks.map(t => ({ ...t, config: { ...t.config } })),
        strictness: { ...editChallenge.strictness },
      };
    }
    return {
      name: '',
      duration: 75,
      customDuration: '',
      tasks: [],
      strictness: { failureMode: 'restart', gracePeriod: 0, freezes: 0, minTasks: 'all' },
    };
  });
  const [showCustomDur, setShowCustomDur] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [showCustomTask, setShowCustomTask] = useState(false);
  const [customTaskName, setCustomTaskName] = useState('');
  const [customTaskType, setCustomTaskType] = useState<Task['type']>('checkbox');
  const [customConfig, setCustomConfig] = useState<any>({});

  const progress = (step / 5) * 100;
  const addedSigs = useMemo(() => new Set(wiz.tasks.map(t => t.name + '|' + t.type)), [wiz.tasks]);

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1 && !wiz.name.trim()) {
      showToast('Give your challenge a name!');
      return;
    }
    if (step === 3 && wiz.tasks.length === 0) {
      showToast('Add at least one task');
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  }, [step, wiz]);

  const goBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) { router.back(); return; }
    setStep(s => s - 1);
  }, [step, router]);

  const addTask = useCallback((t: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWiz(w => ({ ...w, tasks: [...w.tasks, { ...t, config: { ...t.config } }] }));
  }, []);

  const removeTask = useCallback((idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWiz(w => ({ ...w, tasks: w.tasks.filter((_, i) => i !== idx) }));
    setEditingTask(null);
  }, []);

  const addSuggestion = useCallback((sug: TaskSuggestion) => {
    const newTask = { name: sug.name, type: sug.type, icon: sug.icon, config: { ...sug.config } } as Task;
    setWiz(w => {
      const newTasks = [...w.tasks, { ...newTask, config: { ...newTask.config } }];
      // Open editor for newly added task
      setTimeout(() => setEditingTask(newTasks.length - 1), 50);
      return { ...w, tasks: newTasks };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const useTemplate = useCallback((idx: number) => {
    const t = TEMPLATES[idx];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWiz(w => ({
      ...w,
      name: w.name || t.name,
      duration: t.duration,
      tasks: t.tasks.map(task => ({ ...task, config: { ...task.config } })),
      strictness: { ...t.strictness },
    }));
  }, []);

  const handleFinish = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isEditing && editChallenge) {
      updateChallenge(editChallenge.id, {
        name: wiz.name.trim(),
        tasks: wiz.tasks,
        strictness: wiz.strictness,
      });
      showToast('✅ Challenge updated!');
    } else {
      const dur = showCustomDur && wiz.customDuration
        ? parseInt(wiz.customDuration) || wiz.duration
        : wiz.duration;
      createChallenge(wiz.name.trim(), dur, wiz.tasks, wiz.strictness);
      showToast('🔥 Challenge started!');
    }
    router.replace('/');
  }, [wiz, showCustomDur, createChallenge, updateChallenge, isEditing, editChallenge, router]);

  const saveCustomTask = useCallback(() => {
    if (!customTaskName.trim()) { showToast('Task needs a name'); return; }
    const config: any = { ...customConfig };
    if (customTaskType === 'timer') config.targetSec = (parseInt(customConfig.targetMin) || 30) * 60;
    if (customTaskType === 'water') config.targetOz = parseInt(customConfig.targetOz) || 64;
    if (customTaskType === 'value') { config.target = parseInt(customConfig.target) || 0; config.unit = customConfig.unit || ''; }
    if (customTaskType === 'multi') config.options = (customConfig.optionsStr || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    if (customTaskType === 'counter') config.unit = customConfig.unit || 'times';

    addTask({ name: customTaskName.trim(), type: customTaskType, icon: TASK_ICONS[customTaskType], config });
    setShowCustomTask(false);
    setCustomTaskName('');
    setCustomConfig({});
  }, [customTaskName, customTaskType, customConfig, addTask]);

  // ─── STEP RENDERERS ────────────────────

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: primary.t1 }]}>What will you call{'\n'}your challenge?</Text>
      <Text style={[styles.stepDesc, { color: primary.t2 }]}>Choose a name that inspires you. Make it powerful.</Text>

      <TextInput
        style={[styles.nameInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
        placeholder="e.g. Iron Mind 75"
        placeholderTextColor={primary.t3}
        value={wiz.name}
        onChangeText={name => setWiz(w => ({ ...w, name }))}
        autoFocus
      />

      <View style={styles.chipRow}>
        {NAME_SUGGESTIONS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: primary.border }]}
            onPress={() => setWiz(w => ({ ...w, name: s }))}
          >
            <Text style={[styles.chipText, { color: primary.t2 }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: primary.t1 }]}>How long will it take?</Text>
      <Text style={[styles.stepDesc, { color: primary.t2 }]}>Pick your commitment. Longer = harder, but more transformative.</Text>

      <View style={styles.durGrid}>
        {DURATIONS.map(d => (
          <TouchableOpacity
            key={d}
            style={[
              styles.durChip,
              { borderColor: wiz.duration === d && !showCustomDur ? accent.accent : primary.border },
              wiz.duration === d && !showCustomDur && { backgroundColor: accent.accent + '18' },
            ]}
            onPress={() => { setWiz(w => ({ ...w, duration: d })); setShowCustomDur(false); }}
          >
            <Text style={[styles.durNum, { color: wiz.duration === d && !showCustomDur ? accent.accentL : primary.t1 }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.chip, { borderColor: showCustomDur ? accent.accent : primary.border, alignSelf: 'center', marginTop: 16 }]}
        onPress={() => setShowCustomDur(!showCustomDur)}
      >
        <Text style={[styles.chipText, { color: primary.t2 }]}>Custom Duration</Text>
      </TouchableOpacity>

      {showCustomDur && (
        <TextInput
          style={[styles.nameInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border, marginTop: 12, width: 140, alignSelf: 'center' }]}
          keyboardType="number-pad"
          placeholder="Days"
          placeholderTextColor={primary.t3}
          value={wiz.customDuration}
          onChangeText={v => setWiz(w => ({ ...w, customDuration: v }))}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: primary.t1 }]}>What will you do{'\n'}every day?</Text>
      <Text style={[styles.stepDesc, { color: primary.t2 }]}>Pick a template or build your own task list.</Text>

      {/* Template carousel */}
      <Text style={[styles.cap, { color: primary.t2 }]}>QUICK START TEMPLATES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tplScroll} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
        {TEMPLATES.map((t, i) => {
          const mood = MOOD_COLORS[t.name] || accent.accent;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.tplCard, { backgroundColor: primary.bgE, borderColor: primary.border, borderTopColor: mood, borderTopWidth: 3 }]}
              onPress={() => useTemplate(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tplCardName, { color: primary.t1 }]}>{t.name}</Text>
              <Text style={[styles.tplCardMeta, { color: primary.t3 }]}>{t.duration}d · {t.tasks.length} tasks</Text>
              <View style={[styles.tplBadge, { backgroundColor: mood + '18' }]}>
                <Text style={[styles.tplBadgeText, { color: mood }]}>
                  {t.strictness.failureMode === 'restart' ? 'Hard' : 'Flex'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.divider, { backgroundColor: primary.divider }]} />

      {/* Your tasks */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.h3, { color: primary.t1 }]}>Your Tasks</Text>
        {wiz.tasks.length > 0 && (
          <View style={[styles.badge, { backgroundColor: accent.accent + '18' }]}>
            <Text style={[styles.badgeText, { color: accent.accentL }]}>{wiz.tasks.length} task{wiz.tasks.length > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {wiz.tasks.length === 0 ? (
        <View style={[styles.emptyTasks, { borderColor: primary.border }]}>
          <Text style={[styles.emptyText, { color: primary.t3 }]}>Pick a template above or tap suggestions below ↓</Text>
        </View>
      ) : (
        wiz.tasks.map((t, i) => (
          <View key={i}>
            <View style={[styles.taskRow, { backgroundColor: primary.bgE, borderColor: editingTask === i ? accent.accent : primary.borderA }]}>
              <View style={[styles.taskPreview, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={{ fontSize: 16 }}>{t.icon || TASK_ICONS[t.type]}</Text>
              </View>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditingTask(editingTask === i ? null : i)}>
                <Text style={[styles.taskRowName, { color: primary.t1 }]}>{t.name}</Text>
                <Text style={[styles.taskRowMeta, { color: primary.t3 }]}>
                  {TYPE_LABELS[t.type]}
                  {t.config?.targetSec ? ` · ${Math.round(t.config.targetSec / 60)} min` : ''}
                  {t.config?.targetOz ? ` · ${t.config.targetOz} oz` : ''}
                  {t.config?.target ? ` · ${t.config.target} ${t.config.unit || ''}` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingTask(editingTask === i ? null : i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 8 }}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeTask(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ fontSize: 18, color: primary.t3 }}>×</Text>
              </TouchableOpacity>
            </View>
            {editingTask === i && (
              <View style={[styles.editorCard, { backgroundColor: primary.bgS, borderColor: accent.accent, marginTop: -4, borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}>
                <Text style={[styles.cap, { color: primary.t2, marginBottom: 4 }]}>TASK NAME</Text>
                <TextInput
                  style={[styles.editorInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                  value={t.name}
                  onChangeText={v => setWiz(w => ({ ...w, tasks: w.tasks.map((tk, ti) => ti === i ? { ...tk, name: v } : tk) }))}
                />
                {t.type === 'timer' && (
                  <View style={styles.configField}>
                    <Text style={[styles.configLabel, { color: primary.t3 }]}>Target (minutes)</Text>
                    <TextInput
                      style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                      keyboardType="number-pad" value={String(Math.round((t.config?.targetSec || 0) / 60))}
                      onChangeText={v => setWiz(w => ({ ...w, tasks: w.tasks.map((tk, ti) => ti === i ? { ...tk, config: { ...tk.config, targetSec: (parseInt(v) || 0) * 60 } } : tk) }))}
                    />
                  </View>
                )}
                {t.type === 'water' && (
                  <View style={styles.configField}>
                    <Text style={[styles.configLabel, { color: primary.t3 }]}>Target (oz)</Text>
                    <TextInput
                      style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                      keyboardType="number-pad" value={String(t.config?.targetOz || 64)}
                      onChangeText={v => setWiz(w => ({ ...w, tasks: w.tasks.map((tk, ti) => ti === i ? { ...tk, config: { ...tk.config, targetOz: parseInt(v) || 0 } } : tk) }))}
                    />
                  </View>
                )}
                {t.type === 'value' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={[styles.configField, { flex: 1 }]}>
                      <Text style={[styles.configLabel, { color: primary.t3 }]}>Target</Text>
                      <TextInput
                        style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                        keyboardType="number-pad" value={String(t.config?.target || 0)}
                        onChangeText={v => setWiz(w => ({ ...w, tasks: w.tasks.map((tk, ti) => ti === i ? { ...tk, config: { ...tk.config, target: parseInt(v) || 0 } } : tk) }))}
                      />
                    </View>
                    <View style={[styles.configField, { flex: 1 }]}>
                      <Text style={[styles.configLabel, { color: primary.t3 }]}>Unit</Text>
                      <TextInput
                        style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                        value={t.config?.unit || ''}
                        onChangeText={v => setWiz(w => ({ ...w, tasks: w.tasks.map((tk, ti) => ti === i ? { ...tk, config: { ...tk.config, unit: v } } : tk) }))}
                      />
                    </View>
                  </View>
                )}
                {t.type === 'counter' && (
                  <View style={styles.configField}>
                    <Text style={[styles.configLabel, { color: primary.t3 }]}>Unit label</Text>
                    <TextInput
                      style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                      value={t.config?.unit || 'times'}
                      onChangeText={v => setWiz(w => ({ ...w, tasks: w.tasks.map((tk, ti) => ti === i ? { ...tk, config: { ...tk.config, unit: v } } : tk) }))}
                    />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.editorBtn, { backgroundColor: accent.accent, marginTop: 12 }]}
                  onPress={() => setEditingTask(null)}
                >
                  <Text style={[styles.editorBtnText, { color: '#fff' }]}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      <View style={[styles.divider, { backgroundColor: primary.divider }]} />

      {/* Suggestions */}
      <Text style={[styles.cap, { color: primary.t2 }]}>SUGGESTIONS</Text>
      {TASK_SUGGESTIONS.map((cat, ci) => (
        <View key={ci} style={{ marginBottom: 16 }}>
          <Text style={[styles.catTitle, { color: primary.t2 }]}>{cat.cat}</Text>
          {cat.items.map((item, si) => {
            const isAdded = addedSigs.has(item.name + '|' + item.type);
            return (
              <TouchableOpacity
                key={si}
                style={[styles.sugRow, { borderColor: primary.border }, isAdded && { opacity: 0.35 }]}
                onPress={() => !isAdded && addSuggestion(item)}
                disabled={isAdded}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sugName, { color: primary.t1 }]}>{item.name}</Text>
                  <Text style={[styles.sugDesc, { color: primary.t3 }]}>{item.desc}</Text>
                </View>
                <View style={[styles.sugAdd, { backgroundColor: isAdded ? colors.ok + '18' : accent.accent + '18', borderColor: isAdded ? colors.ok + '33' : accent.accent + '33' }]}>
                  <Text style={{ fontSize: 16, color: isAdded ? colors.ok : accent.accentL }}>{isAdded ? '✓' : '+'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Custom task button */}
      {!showCustomTask ? (
        <TouchableOpacity
          style={[styles.customBtn, { borderColor: 'rgba(255,255,255,0.1)' }]}
          onPress={() => setShowCustomTask(true)}
        >
          <Text style={[styles.customBtnText, { color: primary.t3 }]}>⚡ Custom Task</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.editorCard, { backgroundColor: primary.bgS, borderColor: accent.accent }]}>
          <Text style={[styles.cap, { color: primary.t2, marginBottom: 8 }]}>TASK NAME</Text>
          <TextInput
            style={[styles.editorInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
            placeholder="e.g. Workout 45 min"
            placeholderTextColor={primary.t3}
            value={customTaskName}
            onChangeText={setCustomTaskName}
          />
          <Text style={[styles.cap, { color: primary.t2, marginTop: 12, marginBottom: 8 }]}>TYPE</Text>
          <View style={styles.typeGrid}>
            {TASK_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  { borderColor: customTaskType === type ? accent.accent : 'transparent', backgroundColor: customTaskType === type ? accent.accent + '0F' : 'rgba(255,255,255,0.03)' },
                ]}
                onPress={() => setCustomTaskType(type)}
              >
                <Text style={{ fontSize: 20 }}>{TASK_ICONS[type]}</Text>
                <Text style={[styles.typeLabel, { color: customTaskType === type ? accent.accentL : primary.t3 }]}>{TYPE_LABELS[type]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Config fields based on type */}
          {customTaskType === 'timer' && (
            <View style={styles.configField}>
              <Text style={[styles.configLabel, { color: primary.t3 }]}>Target (minutes)</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                keyboardType="number-pad" placeholder="30" placeholderTextColor={primary.t3}
                value={customConfig.targetMin || ''}
                onChangeText={v => setCustomConfig({ ...customConfig, targetMin: v })}
              />
            </View>
          )}
          {customTaskType === 'water' && (
            <View style={styles.configField}>
              <Text style={[styles.configLabel, { color: primary.t3 }]}>Target (oz)</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                keyboardType="number-pad" placeholder="64" placeholderTextColor={primary.t3}
                value={customConfig.targetOz || ''}
                onChangeText={v => setCustomConfig({ ...customConfig, targetOz: v })}
              />
            </View>
          )}
          {customTaskType === 'value' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[styles.configField, { flex: 1 }]}>
                <Text style={[styles.configLabel, { color: primary.t3 }]}>Target</Text>
                <TextInput
                  style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                  keyboardType="number-pad" placeholder="10" placeholderTextColor={primary.t3}
                  value={customConfig.target || ''}
                  onChangeText={v => setCustomConfig({ ...customConfig, target: v })}
                />
              </View>
              <View style={[styles.configField, { flex: 1 }]}>
                <Text style={[styles.configLabel, { color: primary.t3 }]}>Unit</Text>
                <TextInput
                  style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                  placeholder="pages" placeholderTextColor={primary.t3}
                  value={customConfig.unit || ''}
                  onChangeText={v => setCustomConfig({ ...customConfig, unit: v })}
                />
              </View>
            </View>
          )}
          {customTaskType === 'multi' && (
            <View style={styles.configField}>
              <Text style={[styles.configLabel, { color: primary.t3 }]}>Options (comma separated)</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                placeholder="Option A, Option B" placeholderTextColor={primary.t3}
                value={customConfig.optionsStr || ''}
                onChangeText={v => setCustomConfig({ ...customConfig, optionsStr: v })}
              />
            </View>
          )}
          {customTaskType === 'counter' && (
            <View style={styles.configField}>
              <Text style={[styles.configLabel, { color: primary.t3 }]}>Unit label</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: primary.bgI, color: primary.t1, borderColor: primary.border }]}
                placeholder="times" placeholderTextColor={primary.t3}
                value={customConfig.unit || ''}
                onChangeText={v => setCustomConfig({ ...customConfig, unit: v })}
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.editorBtn, { backgroundColor: 'rgba(255,255,255,0.06)', flex: 1 }]}
              onPress={() => { setShowCustomTask(false); setCustomTaskName(''); setCustomConfig({}); }}
            >
              <Text style={[styles.editorBtnText, { color: primary.t2 }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editorBtn, { backgroundColor: accent.accent, flex: 1 }]}
              onPress={saveCustomTask}
            >
              <Text style={[styles.editorBtnText, { color: '#fff' }]}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: primary.t1 }]}>How strict should it be?</Text>
      <Text style={[styles.stepDesc, { color: primary.t2 }]}>Set your rules. This determines what happens when you slip.</Text>

      <View style={[styles.cfgCard, { backgroundColor: primary.bgS, borderColor: primary.border }]}>
        {/* Failure Mode */}
        <View style={[styles.cfgRow, { borderBottomColor: primary.divider }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cfgLabel, { color: primary.t1 }]}>Failure Mode</Text>
            <Text style={[styles.cfgDesc, { color: primary.t2 }]}>Miss a day → restart or continue?</Text>
          </View>
          <View style={styles.cfgPills}>
            {(['restart', 'continue'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.cfgPill, { borderColor: wiz.strictness.failureMode === m ? accent.accent : primary.border, backgroundColor: wiz.strictness.failureMode === m ? accent.accent + '18' : 'transparent' }]}
                onPress={() => setWiz(w => ({ ...w, strictness: { ...w.strictness, failureMode: m } }))}
              >
                <Text style={[styles.cfgPillText, { color: wiz.strictness.failureMode === m ? accent.accentL : primary.t2 }]}>
                  {m === 'restart' ? '🔄 Restart' : '➡️ Continue'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grace Period */}
        <View style={[styles.cfgRow, { borderBottomColor: primary.divider }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cfgLabel, { color: primary.t1 }]}>Grace Period</Text>
            <Text style={[styles.cfgDesc, { color: primary.t2 }]}>Hours after midnight to log</Text>
          </View>
          <View style={styles.cfgChips}>
            {[0, 1, 2, 4].map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.cfgChip, { borderColor: wiz.strictness.gracePeriod === h ? accent.accent : primary.border, backgroundColor: wiz.strictness.gracePeriod === h ? accent.accent + '18' : 'transparent' }]}
                onPress={() => setWiz(w => ({ ...w, strictness: { ...w.strictness, gracePeriod: h } }))}
              >
                <Text style={[styles.cfgChipText, { color: wiz.strictness.gracePeriod === h ? accent.accentL : primary.t2 }]}>
                  {h === 0 ? 'None' : h + 'h'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Freezes */}
        <View style={styles.cfgRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cfgLabel, { color: primary.t1 }]}>Streak Freezes</Text>
            <Text style={[styles.cfgDesc, { color: primary.t2 }]}>Free passes you can use</Text>
          </View>
          <View style={styles.cfgChips}>
            {[0, 1, 2, 3, 5].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.cfgChip, { borderColor: wiz.strictness.freezes === n ? accent.accent : primary.border, backgroundColor: wiz.strictness.freezes === n ? accent.accent + '18' : 'transparent' }]}
                onPress={() => setWiz(w => ({ ...w, strictness: { ...w.strictness, freezes: n } }))}
              >
                <Text style={[styles.cfgChipText, { color: wiz.strictness.freezes === n ? accent.accentL : primary.t2 }]}>
                  {n === 0 ? 'None' : String(n)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => {
    const dur = showCustomDur && wiz.customDuration ? parseInt(wiz.customDuration) || wiz.duration : wiz.duration;
    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: primary.t1 }]}>Ready to begin?</Text>
        <Text style={[styles.stepDesc, { color: primary.t2 }]}>Review your challenge. Once you start, the countdown begins.</Text>

        <View style={[styles.summaryCard, { backgroundColor: primary.bgE, borderColor: primary.border }]}>
          <Text style={[styles.summaryTitle, { color: accent.accentL }]}>Challenge Details</Text>
          <View style={[styles.summaryRow, { borderBottomColor: primary.divider }]}>
            <Text style={{ color: primary.t2 }}>Name</Text>
            <Text style={[styles.summaryVal, { color: primary.t1 }]}>{wiz.name}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomColor: primary.divider }]}>
            <Text style={{ color: primary.t2 }}>Duration</Text>
            <Text style={[styles.summaryVal, { color: primary.t1 }]}>{dur} days</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomColor: primary.divider }]}>
            <Text style={{ color: primary.t2 }}>Tasks</Text>
            <Text style={[styles.summaryVal, { color: primary.t1 }]}>{wiz.tasks.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: primary.t2 }}>Strictness</Text>
            <Text style={[styles.summaryVal, { color: primary.t1 }]}>
              {wiz.strictness.failureMode === 'restart' ? 'Hardcore' : 'Flexible'}
            </Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: primary.bgE, borderColor: primary.border }]}>
          <Text style={[styles.summaryTitle, { color: accent.accentL }]}>Daily Tasks</Text>
          {wiz.tasks.map((t, i) => (
            <View key={i} style={styles.summaryTask}>
              <View style={[styles.summaryDot, { backgroundColor: accent.accent }]} />
              <Text style={{ color: primary.t2, fontSize: 13 }}>{t.icon || TASK_ICONS[t.type]} {t.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: primary.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
          <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: accent.accent }]} />
        </View>

        {/* Step dots */}
        <View style={styles.dots}>
          {[1, 2, 3, 4, 5].map(s => (
            <View
              key={s}
              style={[
                styles.dot,
                s === step && { backgroundColor: accent.accent, width: 24, borderRadius: 4 },
                s < step && { backgroundColor: colors.ok },
                s > step && { backgroundColor: 'rgba(255,255,255,0.1)' },
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </ScrollView>

        {/* Actions */}
        <View style={[styles.actions, { borderTopColor: primary.divider }]}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: primary.border }]}
            onPress={goBack}
          >
            <Text style={[styles.backBtnText, { color: primary.t1 }]}>
              {step === 1 ? 'Cancel' : '← Back'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: accent.accent, opacity: (step === 3 && wiz.tasks.length === 0) ? 0.4 : 1 }]}
            onPress={step === 5 ? handleFinish : goNext}
          >
            <Text style={styles.nextBtnText}>
              {step === 5 ? (isEditing ? '✅ Save Changes' : '🔥 Begin Challenge') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressBar: { height: 4, borderRadius: 2, marginHorizontal: 20, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 50 },

  scrollContent: { padding: 20, paddingBottom: 40 },
  stepContainer: { flex: 1 },
  stepTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginBottom: 8, lineHeight: 32 },
  stepDesc: { fontSize: 14, lineHeight: 22, marginBottom: 28 },

  // Step 1
  nameInput: { height: 56, fontSize: 18, fontWeight: '600', textAlign: 'center', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  chip: { height: 36, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 13, fontWeight: '500' },

  // Step 2
  durGrid: { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  durChip: { width: 64, height: 64, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  durNum: { fontSize: 22, fontWeight: '800' },

  // Step 3
  cap: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  tplScroll: { marginBottom: 16, marginHorizontal: -20, paddingLeft: 20 },
  tplCard: { width: 140, padding: 14, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  tplCardName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  tplCardMeta: { fontSize: 10, lineHeight: 14 },
  tplBadge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  tplBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  divider: { height: 1, marginVertical: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  h3: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  emptyTasks: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  taskRow: { borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  taskPreview: { width: 48, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  taskRowName: { fontSize: 14, fontWeight: '600' },
  taskRowMeta: { fontSize: 11, marginTop: 2 },

  catTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  sugRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 6 },
  sugName: { fontSize: 13, fontWeight: '600' },
  sugDesc: { fontSize: 11, marginTop: 1 },
  sugAdd: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  customBtn: { padding: 14, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 10, alignItems: 'center', marginTop: 16 },
  customBtnText: { fontSize: 13, fontWeight: '600' },

  editorCard: { borderRadius: 14, padding: 16, borderWidth: 1.5, marginTop: 16 },
  editorInput: { height: 44, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, fontSize: 15, fontWeight: '600' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeOption: { width: '23%' as any, alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 2, gap: 4 },
  typeLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  configField: { marginTop: 12 },
  configLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  configInput: { height: 38, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, fontSize: 14 },
  editorBtn: { height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  editorBtnText: { fontWeight: '600', fontSize: 14 },

  // Step 4
  cfgCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  cfgRow: { paddingVertical: 14, borderBottomWidth: 1 },
  cfgLabel: { fontSize: 14, fontWeight: '500' },
  cfgDesc: { fontSize: 12, marginTop: 2 },
  cfgPills: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cfgPill: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cfgPillText: { fontSize: 13, fontWeight: '500' },
  cfgChips: { flexDirection: 'row', gap: 6, marginTop: 10 },
  cfgChip: { height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cfgChipText: { fontSize: 12, fontWeight: '600' },

  // Step 5
  summaryCard: { borderRadius: 14, padding: 18, borderWidth: 1, marginBottom: 16 },
  summaryTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  summaryVal: { fontWeight: '600' },
  summaryTask: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  summaryDot: { width: 6, height: 6, borderRadius: 3 },

  // Actions
  actions: { flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 28, borderTopWidth: 1 },
  backBtn: { height: 54, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontWeight: '600', fontSize: 15 },
  nextBtn: { flex: 1, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
