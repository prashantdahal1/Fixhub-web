import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { backendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Chat proxy request body:', body);

    const backendUrl = backendApiUrl('/api/v1/chat');
    console.log('Chat proxy backend URL:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Chat proxy backend responsetatus:', backendResponse.status);

    const responseText = await backendResponse.text();
    console.log('Chat proxy backend raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Chat proxy failed to parse backend JSON response:', jsonError, responseText);
      return NextResponse.json(
        {
          message: 'Backend returned an invalid response',
          details: responseText,
          status: backendResponse.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (e: any) {
    console.error('Chat proxy error:', e);
    return NextResponse.json(
      {
        message: 'Backend unreachable. Check that the Express server is running and BACKEND_URL is correct.',
        error: e?.message || String(e),
      },
      { status: 503 }
    );
  }
}
