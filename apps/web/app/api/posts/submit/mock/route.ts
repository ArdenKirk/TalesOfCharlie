import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, mockDecision, mockSummaryMd, mockTags } = body;

    if (!url || !mockDecision || !mockSummaryMd || !mockTags) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    if (!['APPROVE', 'DENY'].includes(mockDecision)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DECISION', message: 'Invalid mock decision' } },
        { status: 400 }
      );
    }

    if (!Array.isArray(mockTags)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TAGS', message: 'Tags must be an array' } },
        { status: 400 }
      );
    }

    // Forward request to internal API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/posts/submit/mock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You could add JWT token here if needed for internal auth
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        mockDecision,
        mockSummaryMd,
        mockTags,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status as number });

  } catch (error) {
    console.error('Error in posts submit mock API route:', error);
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
