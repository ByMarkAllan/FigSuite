import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    application: 'FigSuite',
    version: '0.1.0',
    mode: 'simulation-demo',
    data: 'illustrative',
    liveTrading: false,
    payoutsEnabled: false,
    persistence: false,
  }, { headers: { 'Cache-Control': 'no-store' }});
}
