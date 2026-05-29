import type { Config } from 'tailwindcss';
import { preset } from '@nacianilcom/ui/tailwind';

const config: Config = {
  presets: [preset as unknown as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
};

export default config;
