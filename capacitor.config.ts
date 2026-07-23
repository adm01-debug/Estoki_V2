import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d9a2e2d9b9d442789f8735b47b961e34',
  appName: 'cart-bloom-connect',
  webDir: 'dist',
  server: {
    url: 'https://d9a2e2d9-b9d4-4278-9f87-35b47b961e34.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;