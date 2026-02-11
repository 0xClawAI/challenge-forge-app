import React, { useState } from 'react';
import {
  View, Text, Modal, Image, StyleSheet, TouchableOpacity,
  Dimensions, Platform, Alert, StatusBar,
} from 'react-native';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  uri: string;
  visible: boolean;
  onClose: () => void;
  primary: any;
  accent: any;
}

export function PhotoViewer({ uri, visible, onClose, primary, accent }: Props) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      setSharing(true);
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Progress Photo',
      });
    } catch (e) {
      console.warn('Share error:', e);
    } finally {
      setSharing(false);
    }
  };

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* Image */}
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Bottom actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: accent?.accent || '#7C5CFC' }]}
            onPress={handleShare}
            disabled={sharing}
          >
            <Text style={styles.actionBtnText}>
              {sharing ? '⏳ Loading...' : '📤 Share / Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.7,
  },
  actions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
