import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Safe public information only. Never reports activation based on env flags. */
export async function GET() {
  return NextResponse.json({
    state: 'DISABLED_PENDING_INDEPENDENT_APPROVALS',
    payoutsEnabled: false,
    recipientEnrollmentEnabled: false,
    providerEgressEnabled: false,
    simulationToCashConversionEnabled: false,
    canActivateFromEnvironmentVariable: false,
    workflow: 'FIXED_AWARD_REVIEW_PREVIEW_ONLY',
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
