import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_AUTHOR } from '../../src/lib/site';

export const runtime = 'edge';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') ?? SITE_NAME;
  const title = rawTitle.length > 80 ? rawTitle.slice(0, 77) + '…' : rawTitle;
  const description = (searchParams.get('description') ?? '').slice(0, 150);
  const lang = searchParams.get('lang') ?? 'tr';
  const kind = searchParams.get('kind') ?? 'page';

  const kindLabel =
    lang === 'tr'
      ? kind === 'article'
        ? 'MAKALE'
        : kind === 'series'
          ? 'SERİ'
          : ''
      : kind === 'article'
        ? 'ARTICLE'
        : kind === 'series'
          ? 'SERIES'
          : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f7f5f2',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Accent top bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#9b2335', flexShrink: 0 }} />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 72px 52px',
          }}
        >
          {/* Site name */}
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#625d56',
            }}
          >
            {SITE_NAME}
          </div>

          {/* Title + description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                fontSize: title.length > 55 ? '42px' : '54px',
                fontWeight: 700,
                color: '#1b1a18',
                lineHeight: 1.15,
                letterSpacing: '-0.015em',
              }}
            >
              {title}
            </div>
            {description ? (
              <div
                style={{
                  fontSize: '20px',
                  color: '#625d56',
                  lineHeight: 1.5,
                  fontWeight: 400,
                  paddingLeft: '16px',
                  borderLeft: '3px solid #e8e3dc',
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e8e3dc',
              paddingTop: '20px',
            }}
          >
            <div style={{ fontSize: '15px', color: '#625d56' }}>{SITE_AUTHOR}</div>
            {kindLabel ? (
              <div
                style={{
                  fontSize: '12px',
                  color: '#9b2335',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {lang.toUpperCase()} · {kindLabel}
              </div>
            ) : (
              <div
                style={{
                  fontSize: '12px',
                  color: '#9b2335',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {lang.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
