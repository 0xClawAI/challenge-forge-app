import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated,
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

const ROW_HEIGHT = 64;

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
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);
  const currentOrder = useRef<number[]>([]);
  const rowPositions = useRef<number[]>([]);

  // Track layout positions
  const measureRows = useCallback(() => {
    rowPositions.current = tasks.map((_, i) => i * ROW_HEIGHT);
  }, [tasks.length]);

  const createPanResponder = useCallback((index: number) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start drag on vertical movement > 5px
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setDraggingIdx(index);
        dragStartY.current = index * ROW_HEIGHT;
        dragY.setValue(0);
        currentOrder.current = tasks.map((_, i) => i);
      },
      onPanResponderMove: (_, gestureState) => {
        dragY.setValue(gestureState.dy);

        // Calculate which position we're over
        const currentY = dragStartY.current + gestureState.dy;
        const targetIdx = Math.min(
          tasks.length - 1,
          Math.max(0, Math.round(currentY / ROW_HEIGHT))
        );

        if (targetIdx !== index && currentOrder.current[index] !== undefined) {
          // Swap in the order array
          const newTasks = [...tasks];
          const [removed] = newTasks.splice(index, 1);
          newTasks.splice(targetIdx, 0, removed);

          LayoutAnimation.configureNext({
            duration: 150,
            update: { type: LayoutAnimation.Types.easeInEaseOut },
          });

          onReorder(newTasks);
          setDraggingIdx(targetIdx);
          dragStartY.current = targetIdx * ROW_HEIGHT;
          dragY.setValue(0);
          Haptics.selectionAsync();
        }
      },
      onPanResponderRelease: () => {
        setDraggingIdx(null);
        dragY.setValue(0);
      },
      onPanResponderTerminate: () => {
        setDraggingIdx(null);
        dragY.setValue(0);
      },
    });
  }, [tasks, onReorder]);

  // We need stable pan responders, but they depend on tasks array.
  // Use a ref to hold them and recreate per render.
  const panResponders = useRef<Map<number, ReturnType<typeof PanResponder.create>>>(new Map());

  // Get or create pan responder for index
  const getPanResponder = (index: number) => {
    // Always recreate to capture latest tasks
    return createPanResponder(index);
  };

  return (
    <View>
      <Text style={[{ color: primary.t3, fontSize: 11, marginBottom: 8, textAlign: 'center' }]}>
        Hold & drag to reorder · Tap to edit
      </Text>
      {tasks.map((t, i) => {
        const isDragging = draggingIdx === i;
        const pr = getPanResponder(i);

        return (
          <Animated.View
            key={`task-${i}-${t.name}`}
            style={[
              isDragging && {
                transform: [{ translateY: dragY }],
                zIndex: 999,
                elevation: 10,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Drag handle */}
              <View
                {...pr.panHandlers}
                style={styles.dragHandle}
              >
                <Text style={{ fontSize: 16, color: primary.t3, lineHeight: 16 }}>☰</Text>
              </View>

              {/* Task row */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.taskRow,
                  {
                    flex: 1,
                    backgroundColor: isDragging ? primary.bgE + 'DD' : primary.bgE,
                    borderColor: editingTask === i ? accent.accent : primary.borderA,
                    ...(isDragging ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    } : {}),
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
                <TouchableOpacity onPress={() => onEdit(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 8 }}>
                  <Text style={{ fontSize: 14 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onRemove(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={{ fontSize: 18, color: primary.t3 }}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* Arrow buttons as fallback */}
            <View style={styles.arrowRow}>
              <TouchableOpacity
                disabled={i === 0}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const newTasks = [...tasks];
                  [newTasks[i - 1], newTasks[i]] = [newTasks[i], newTasks[i - 1]];
                  onReorder(newTasks);
                  if (editingTask === i) onEdit(i - 1);
                  else if (editingTask === i - 1) onEdit(i);
                }}
                hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 12, color: i === 0 ? primary.border : primary.t3 }}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={i === tasks.length - 1}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const newTasks = [...tasks];
                  [newTasks[i], newTasks[i + 1]] = [newTasks[i + 1], newTasks[i]];
                  onReorder(newTasks);
                  if (editingTask === i) onEdit(i + 1);
                  else if (editingTask === i + 1) onEdit(i);
                }}
                hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 12, color: i === tasks.length - 1 ? primary.border : primary.t3 }}>▼</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dragHandle: {
    width: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  taskRow: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
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
  arrowRow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 8,
    width: 0, // Hidden - only show drag handle
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0, // Hidden fallback
  },
});
