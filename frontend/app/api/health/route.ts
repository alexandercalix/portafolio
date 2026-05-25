import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      service: 'frontend',
      timestampUtc: new Date().toISOString()
    },
    { status: 200 }
  );
}