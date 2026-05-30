import type { Config } from 'tailwindcss';
import { preset } from '@nacianilcom/ui/tailwind';
import typography from '@tailwindcss/typography';

const config: Config = {
  presets: [preset as unknown as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(27 26 24)',
            '--tw-prose-headings': 'rgb(27 26 24)',
            '--tw-prose-lead': 'rgb(98 93 86)',
            '--tw-prose-links': 'rgb(155 35 53)',
            '--tw-prose-bold': 'rgb(27 26 24)',
            '--tw-prose-counters': 'rgb(98 93 86)',
            '--tw-prose-bullets': 'rgb(98 93 86)',
            '--tw-prose-hr': 'rgb(232 227 220)',
            '--tw-prose-quotes': 'rgb(27 26 24)',
            '--tw-prose-quote-borders': 'rgb(155 35 53)',
            '--tw-prose-captions': 'rgb(98 93 86)',
            '--tw-prose-code': 'rgb(27 26 24)',
            '--tw-prose-pre-code': 'rgb(27 26 24)',
            '--tw-prose-pre-bg': 'rgb(247 245 242)',
            '--tw-prose-th-borders': 'rgb(232 227 220)',
            '--tw-prose-td-borders': 'rgb(232 227 220)',
            fontFamily: 'var(--font-sans)',
            maxWidth: 'none',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-serif)',
            },
            'code, pre': {
              fontFamily: 'var(--font-mono)',
            },
            a: {
              color: 'rgb(155 35 53)',
              textDecorationColor: 'rgb(155 35 53 / 0.35)',
            },
            'a:hover': {
              textDecorationColor: 'rgb(155 35 53)',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
