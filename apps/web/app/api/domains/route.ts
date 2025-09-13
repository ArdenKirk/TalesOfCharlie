import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'whitelist', 'blacklist', or 'reviews'

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    let endpoint: string;
    switch (type) {
      case 'whitelist':
        endpoint = `${apiUrl}/api/domains/whitelist`;
        break;
      case 'blacklist':
        endpoint = `${apiUrl}/api/domains/blacklist`;
        break;
      case 'reviews':
        endpoint = `${apiUrl}/api/domains/reviews`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_TYPE', message: 'Type must be whitelist, blacklist, or reviews' } },
          { status: 400 }
        );
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status as number });

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
    return NextResponse.json(data, { status: response.status as number });

  } catch (error) {
    console.error('Error in domains POST API route:', error);
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
