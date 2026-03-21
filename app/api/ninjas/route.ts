import { NextRequest, NextResponse } from 'next/server';
import { fetchNinjas } from '@/lib/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('lang') || 'pt';

  try {
    const ninjas = await fetchNinjas(locale);
    return NextResponse.json(
      { ninjas, locale },
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
      { ninjas: [], locale, error: 'Failed to fetch ninjas' },
      { status: 500 }
    );
  }
}
