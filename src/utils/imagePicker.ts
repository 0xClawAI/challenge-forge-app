import { Platform } from 'react-native';

// Web-safe image picker wrapper
const isNative = Platform.OS !== 'web';

let ImagePickerModule: typeof import('expo-image-picker') | null = null;

if (isNative) {
  ImagePickerModule = require('expo-image-picker');
}

export async function launchImageLibraryAsync(options?: any) {
  if (ImagePickerModule) {
    return ImagePickerModule.launchImageLibraryAsync(options);
  }
  // Web fallback: use file input
  return new Promise<any>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const uri = URL.createObjectURL(file);
        resolve({ canceled: false, assets: [{ uri }] });
      } else {
        resolve({ canceled: true, assets: [] });
      }
    };
    input.click();
  });
}

export async function launchCameraAsync(options?: any) {
  if (ImagePickerModule) {
    return ImagePickerModule.launchCameraAsync(options);
  }
  // Web: fall back to image library
  return launchImageLibraryAsync(options);
}

export async function requestCameraPermissionsAsync() {
  if (ImagePickerModule) {
    return ImagePickerModule.requestCameraPermissionsAsync();
  }
  return { status: 'granted' as const, granted: true };
}
