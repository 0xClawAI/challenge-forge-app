import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
  challengeName: string;
}

export function SwipeableHistoryItem({ children, onDelete, challengeName }: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const toggleDelete = () => {
    if (showDelete) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start(() => setShowDelete(false));
    } else {
      setShowDelete(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Challenge',
      `Delete "${challengeName}" from history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: toggleDelete },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Animated.timing(slideAnim, {
              toValue: 2,
              duration: 250,
              useNativeDriver: true,
            }).start(() => onDelete());
          },
        },
      ]
    );
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -80, -SCREEN_WIDTH],
  });

  return (
    <View style={styles.container}>
      {/* Delete button behind */}
      {showDelete && (
        <View style={styles.deleteContainer}>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={styles.deleteIcon}>🗑️</Text>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={toggleDelete}
          delayLongPress={400}
        >
          {children}
        </TouchableOpacity>
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
    width: 80,
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
