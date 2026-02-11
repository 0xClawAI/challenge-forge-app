import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

let _showToast: (msg: string) => void = (_msg: string) => {};

export function showToast(msg: string) {
  _showToast(msg);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { primary, accent } = useTheme();
  const [message, setMessage] = React.useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  _showToast = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20 }),
    ]).start();
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start(() => setMessage(''));
    }, 2500);
  };

  if (!message) return <>{children}</>;

  return (
    <>
      {children}
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: primary.bgS,
            borderColor: primary.borderA,
            opacity,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.text, { color: primary.t1 }]}>{message}</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 300,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  text: { fontWeight: '600', fontSize: 14, textAlign: 'center' },
});
