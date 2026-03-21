import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use Node.js Runtime to allow HTTP fetches

const SOURCE_BASE_URL = 'http://tazwanted-naruto.server.live:1040/img/ninjaProperties';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const imageUrl = `${SOURCE_BASE_URL}/${pathStr}`;

  try {
    const response = await fetch(imageUrl, {
      next: { revalidate: false }, // Don't cache on server
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();

    // Set aggressive cache headers (30 days)
    const headers = new Headers({
      'Content-Type': response.headers.get('Content-Type') || 'image/png',
      'Cache-Control': 'public, max-age=2592000, immutable',
      'CDN-Cache-Control': 'public, max-age=2592000, immutable',
    });

    return new NextResponse(imageBuffer, { headers });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
