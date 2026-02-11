import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import * as Haptics from '../utils/haptics';
import { Task } from '../types';
import { TASK_ICONS } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TYPE_LABELS: Record<string, string> = {
  checkbox: 'Check', counter: 'Counter', value: 'Value', water: 'Water',
  multi: 'Multi', timer: 'Timer', photo: 'Photo', journal: 'Journal',
};

interface Props {
  tasks: Task[];
  onReorder: (tasks: Task[]) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  editingTask: number | null;
  primary: any;
  accent: any;
}

export function DraggableTaskList({ tasks, onReorder, onEdit, onRemove, editingTask, primary, accent }: Props) {

  const moveUp = (i: number) => {
    if (i === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext({
      duration: 200,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    const newTasks = [...tasks];
    [newTasks[i - 1], newTasks[i]] = [newTasks[i], newTasks[i - 1]];
    onReorder(newTasks);
  };

  const moveDown = (i: number) => {
    if (i === tasks.length - 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext({
      duration: 200,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    const newTasks = [...tasks];
    [newTasks[i], newTasks[i + 1]] = [newTasks[i + 1], newTasks[i]];
    onReorder(newTasks);
  };

  return (
    <View>
      <Text style={[{ color: primary.t3, fontSize: 11, marginBottom: 8, textAlign: 'center' }]}>
        Use arrows to reorder · Tap to edit
      </Text>
      {tasks.map((t, i) => (
        <View key={`task-${i}-${t.name}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {/* Reorder arrows */}
          <View style={styles.arrowCol}>
            <TouchableOpacity
              disabled={i === 0}
              onPress={() => moveUp(i)}
              hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
              style={[styles.arrowBtn, { opacity: i === 0 ? 0.25 : 1 }]}
            >
              <Text style={{ fontSize: 14, color: primary.t2 }}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={i === tasks.length - 1}
              onPress={() => moveDown(i)}
              hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
              style={[styles.arrowBtn, { opacity: i === tasks.length - 1 ? 0.25 : 1 }]}
            >
              <Text style={{ fontSize: 14, color: primary.t2 }}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Task row */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.taskRow,
              {
                flex: 1,
                backgroundColor: primary.bgE,
                borderColor: editingTask === i ? accent.accent : primary.borderA,
              },
            ]}
            onPress={() => onEdit(i)}
          >
            <View style={[styles.taskPreview, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }]}>
              <Text style={{ fontSize: 16 }}>{t.icon || TASK_ICONS[t.type]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskRowName, { color: primary.t1 }]}>{t.name}</Text>
              <Text style={[styles.taskRowMeta, { color: primary.t3 }]}>
                {TYPE_LABELS[t.type]}
                {t.config?.targetSec ? ` · ${Math.round(t.config.targetSec / 60)} min` : ''}
                {t.config?.targetOz ? ` · ${t.config.targetOz} oz` : ''}
                {t.config?.target ? ` · ${t.config.target} ${t.config.unit || ''}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onRemove(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ fontSize: 18, color: primary.t3 }}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  arrowCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 4,
  },
  arrowBtn: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskRow: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  taskPreview: {
    width: 48,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  taskRowName: { fontSize: 14, fontWeight: '600' },
  taskRowMeta: { fontSize: 11, marginTop: 2 },
});
