import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This route proxies login to the Express backend (port 5000).
// The Express backend handles auth and sets the 'token' JWT cookie itself.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    // Forward the response (including Set-Cookie from Express) to the browser
    const response = NextResponse.json(data, { status: backendResponse.status });

    // Copy the Set-Cookie header from the Express response so the JWT cookie
    // gets set on the browser's localhost:3000 origin.
    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    return response;
  } catch (e) {
    console.error('Login proxy error:', e);
    return NextResponse.json({ message: 'Backend unreachable. Is the Express server running on port 5000?' }, { status: 503 });
  }
}
