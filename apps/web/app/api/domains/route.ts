import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check (optional for viewing, but admin-like for management)
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'whitelist'; // whitelist, blacklist, reviews

    // Forward to internal API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    let endpoint = '';
    switch (type) {
      case 'whitelist':
        endpoint = '/api/domains/whitelist';
        break;
      case 'blacklist':
        endpoint = '/api/domains/blacklist';
        break;
      case 'reviews':
        endpoint = '/api/domains/reviews';
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_TYPE', message: 'Invalid type parameter' } },
          { status: 400 }
        );
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in domains API route:', error);
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

// POST for submitting new domain review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/api/domains/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in domain submission API route:', error);
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
