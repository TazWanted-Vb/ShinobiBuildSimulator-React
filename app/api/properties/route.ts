import { NextRequest, NextResponse } from 'next/server';
import { fetchProperties } from '@/lib/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('lang') || 'pt';

  try {
    const properties = await fetchProperties(locale);
    return NextResponse.json(
      { properties, locale },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { properties: [], locale, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
