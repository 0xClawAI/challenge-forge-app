import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const COLORS = ['#7C5CFC', '#10B981', '#F59E0B', '#F97316', '#3B82F6', '#EC4899', '#EF4444'];
const NUM_PIECES = 30;
const { width: W, height: H } = Dimensions.get('window');

interface Piece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  startX: number;
}

export function Confetti({ trigger }: { trigger: number }) {
  const pieces = useRef<Piece[]>([]);
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setShow(true);

    pieces.current = Array.from({ length: NUM_PIECES }, () => {
      const startX = Math.random() * W;
      return {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(1),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 6,
        startX,
      };
    });

    const anims = pieces.current.map((p) => {
      const dur = 1200 + Math.random() * 800;
      return Animated.parallel([
        Animated.timing(p.y, { toValue: -(200 + Math.random() * 350), duration: dur, useNativeDriver: true }),
        Animated.timing(p.x, { toValue: (Math.random() - 0.5) * 250, duration: dur, useNativeDriver: true }),
        Animated.timing(p.rotate, { toValue: Math.random() * 720, duration: dur, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0, duration: dur, useNativeDriver: true }),
      ]);
    });

    Animated.stagger(20, anims).start(() => setShow(false));
  }, [trigger]);

  if (!show) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.current.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.startX,
            top: H * 0.5 + Math.random() * H * 0.3,
            width: p.size,
            height: p.size,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { rotate: p.rotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
