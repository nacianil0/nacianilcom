import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

function loadRedirects(): Array<{ source: string; destination: string; permanent: boolean }> {
  const filePath = path.join(process.cwd(), '..', '..', 'content', 'redirects.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(raw) as Array<{ from: string; to: string; permanent: boolean }>;
    return items.map(item => ({
      source: item.from,
      destination: item.to,
      permanent: item.permanent,
    }));
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  trailingSlash: false,
  async redirects() {
    return loadRedirects();
  },
};

export default nextConfig;
