import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { backendApiUrl } from '@/lib/backend-url';

// Proxy whoami to the Express backend.
// The Express backend reads the 'token' JWT cookie from the request.
export async function GET(request: NextRequest) {
  try {
    // Forward the cookies from the browser to the Express backend
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';

    const backendResponse = await fetch(backendApiUrl('/api/v1/auth/whoami'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': cookieHeader,
        'Authorization': authHeader,
      },
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (e) {
    console.error('Whoami proxy error:', e);
    return NextResponse.json({ message: 'Backend unreachable. Check that the Express server is running and BACKEND_URL is correct.' }, { status: 503 });
  }
}
