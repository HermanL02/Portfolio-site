import { ImageResponse } from 'next/og';
import { getPost } from '@/lib/posts';

export const alt = 'Blog post by Herman Liang';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Matches the site's elevation ramp so the share card and the page agree.
const BG = '#081008';
const SURFACE = '#191f19';
const BORDER = '#384239';
const GREEN = '#4ade80';
const GREEN_BRIGHT = '#86efac';
const MUTED = '#9db09d';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? 'Herman Liang';
  const tags = post?.tags.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          padding: 64,
          border: `2px solid ${BORDER}`,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 24,
            color: MUTED,
          }}
        >
          <span style={{ color: GREEN }}>$</span>
          <span>cat ~/blog/{slug}.md</span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            fontSize: title.length > 70 ? 54 : 64,
            fontWeight: 700,
            color: GREEN_BRIGHT,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            {tags.map(tag => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  border: `1px solid ${BORDER}`,
                  background: SURFACE,
                  color: MUTED,
                  fontSize: 20,
                  padding: '6px 14px',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Byline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 24,
            fontSize: 24,
            color: MUTED,
          }}
        >
          <span style={{ color: GREEN_BRIGHT, fontWeight: 700 }}>Herman Liang</span>
          <span>hermanyiqunliang.com</span>
        </div>
      </div>
    ),
    size
  );
}
