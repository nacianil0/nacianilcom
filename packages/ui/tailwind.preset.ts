export const preset = {
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
          sunk: 'rgb(var(--color-surface-sunk-rgb) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised-rgb) / <alpha-value>)',
        },
        card: 'rgb(var(--color-card-rgb) / <alpha-value>)',
        hairline: 'rgb(var(--color-hairline-rgb) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-ink-secondary-rgb) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        positive: 'rgb(var(--color-positive-rgb) / <alpha-value>)',
        negative: 'rgb(var(--color-negative-rgb) / <alpha-value>)',
      },
      borderRadius: {
        card: 'var(--radius-card, 14px)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"Courier New"', 'monospace'],
      },
    },
  },
};
