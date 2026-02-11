import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.error}>{this.state.error?.message}</Text>
            <Text style={styles.stack}>{this.state.error?.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#08080C' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ff4444', marginBottom: 12 },
  scroll: { maxHeight: 300, width: '100%' },
  error: { fontSize: 14, color: '#fff', marginBottom: 8 },
  stack: { fontSize: 10, color: '#888', fontFamily: 'monospace' },
});
