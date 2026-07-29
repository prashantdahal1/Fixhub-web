import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { backendApiUrl } from '@/lib/backend-url';

// This route proxies login to the Express backend (port 5000).
// The Express backend handles auth and sets the 'token' JWT cookie itself.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(backendApiUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    console.log('Login response data:', data);

    // Forward the response (including Set-Cookie from Express) to the browser
    const response = NextResponse.json(data, { status: backendResponse.status });

    // Copy the Set-Cookie header from the Express response so the JWT cookie
    // gets set on the browser's localhost:3000 origin.
    const setCookie = backendResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookie);
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    // Also store the token in the response data for localStorage backup
    if (data.success && data.data?.token) {
      console.log('Token from backend:', data.data.token);
      response.cookies.set('token', data.data.token, {
        httpOnly: false, // Allow JavaScript access
        secure: false,   // For development
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });
    }

    return response;
  } catch (e) {
    console.error('Login proxy error:', e);
    return NextResponse.json({ message: 'Backend unreachable. Check that the Express server is running and BACKEND_URL is correct.' }, { status: 503 });
  }
}
