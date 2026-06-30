import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DbUser } from '@/lib/db-user';

const SESSION_COOKIE = 'fixhub_session';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE);
  if (!cookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = Buffer.from(cookie.value, 'base64').toString('utf-8');

  try {
    await connectDB();
    const user = await DbUser.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
