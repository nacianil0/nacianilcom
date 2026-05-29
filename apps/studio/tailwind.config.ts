import type { Config } from 'tailwindcss';
import { preset } from '@nacianilcom/ui/tailwind';

const config: Config = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presets: [preset as unknown as Config],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
};

export default config;
