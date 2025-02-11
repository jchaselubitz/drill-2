// app/api/podcast-search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Parse query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');
  const limit = searchParams.get('limit') || '20';

  if (!term) {
    return NextResponse.json({ error: 'Missing search term' }, { status: 400 });
  }

  // Construct the iTunes Search API URL for podcasts only
  const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term
  )}&entity=podcast&limit=${limit}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch from iTunes API');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
