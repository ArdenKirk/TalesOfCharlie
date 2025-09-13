import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { reviewId } = await params;
    const body = await request.json();
    const { decision, reason } = body;

    // Validate input
    if (!decision || !['APPROVE', 'DENY'].includes(decision)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DECISION', message: 'Decision must be APPROVE or DENY' } },
        { status: 400 }
      );
    }

    if (decision === 'DENY' && !reason?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'REASON_REQUIRED', message: 'Reason is required when denying a domain' } },
        { status: 400 }
      );
    }

    // Forward to internal API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/api/domains/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        decision,
        reason: reason?.trim(),
        deciderId: session.user.id,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in domain decision API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}
