import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  size: number;
  strokeWidth: number;
  progress: number; // 0-100
  color?: string;
  label: string;
}

export function ProgressRing({ size, strokeWidth, progress, color, label }: Props) {
  const { accent, colors, primary } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * 2 * radius;
  const offset = circumference * (1 - Math.min(progress, 100) / 100);
  const fillColor = color || (progress >= 100 ? colors.ok : accent.accent);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          fill="none"
        />
      </Svg>
      <Text style={[styles.label, { fontSize: size * 0.23, color: primary.t1 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
