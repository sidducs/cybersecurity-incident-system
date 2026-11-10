import { NextResponse } from 'next/server';
const { searchSemantic } = require('../../../../lib/vector');

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, severity, status, top_k = 5 } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query string is required.' }, { status: 400 });
    }

    const results = await searchSemantic(query.trim(), {
      severity: severity || undefined,
      status: status || undefined,
      topK: top_k,
    });

    return NextResponse.json({
      success: true,
      query: query.trim(),
      totalResults: results.length,
      results,
    });
  } catch (error) {
    console.error('Semantic search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

