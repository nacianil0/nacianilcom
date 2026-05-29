import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'nacianil.com',
  description: 'Kişisel yayın ve portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
