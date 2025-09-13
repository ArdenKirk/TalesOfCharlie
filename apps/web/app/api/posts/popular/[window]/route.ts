import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ window: string }> }
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { window } = await params;

    // Validate window parameter
    const validWindows = ['hour', 'day', 'week', 'month', 'year'];
    if (!validWindows.includes(window)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_WINDOW', message: 'Invalid popularity window' } },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Forward request to internal API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/posts/popular/${window}?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // You could add JWT token here if needed for internal auth
        // 'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status as number });

  } catch (error) {
    console.error('Error in posts popular API route:', error);
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
