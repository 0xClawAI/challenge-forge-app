import React, { useRef } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -80;
const DELETE_WIDTH = 80;

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
  challengeName: string;
}

export function SwipeableHistoryItem({ children, onDelete, challengeName }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderGrant: () => {
        // If already open, start from -DELETE_WIDTH
        translateX.setOffset(isOpen.current ? -DELETE_WIDTH : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        const val = gs.dx;
        // Only allow left swipe (negative) up to delete width
        if (isOpen.current) {
          // Allow dragging back right or further left
          const clamped = Math.max(-DELETE_WIDTH, Math.min(DELETE_WIDTH, val));
          translateX.setValue(clamped);
        } else {
          const clamped = Math.max(-DELETE_WIDTH - 20, Math.min(0, val));
          translateX.setValue(clamped);
        }
      },
      onPanResponderRelease: (_, gs) => {
        translateX.flattenOffset();
        if (isOpen.current) {
          // If swiped right enough, close
          if (gs.dx > 30) {
            close();
          } else {
            open();
          }
        } else {
          // If swiped left enough, open
          if (gs.dx < SWIPE_THRESHOLD) {
            open();
          } else {
            close();
          }
        }
      },
    })
  ).current;

  const open = () => {
    isOpen.current = true;
    Animated.spring(translateX, {
      toValue: -DELETE_WIDTH,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const close = () => {
    isOpen.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleDelete = () => {
    close();
    Alert.alert(
      'Delete Challenge',
      `Delete "${challengeName}" from history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => onDelete());
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Red delete background */}
      <View style={styles.deleteContainer}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 14,
  },
  deleteContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  deleteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  deleteText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
