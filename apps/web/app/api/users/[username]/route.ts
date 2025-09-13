import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // Authentication is optional - public profiles should be viewable
    const session = await auth();

    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'authored';

    // Forward request to internal API - we need to get user ID by username first
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // First get user data by username
    const userResponse = await fetch(`${apiUrl}/api/auth/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Now get posts by user ID with type filter
    const postsResponse = await fetch(`${apiUrl}/api/posts/user/${userId}?type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await postsResponse.json();
    return NextResponse.json(data, { status: postsResponse.status });

  } catch (error) {
    console.error('Error in user profile API route:', error);
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
