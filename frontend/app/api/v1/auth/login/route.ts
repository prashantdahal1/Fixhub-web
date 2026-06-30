import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DbUser } from '@/lib/db-user';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'fixhub_session';

function setSessionCookie(response: NextResponse, userId: string) {
  const cookieValue = Buffer.from(userId).toString('base64');
  response.headers.set('Set-Cookie', `${SESSION_COOKIE}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax`);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();
    const user = await DbUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const resp = NextResponse.json({ message: 'Logged in' }, { status: 200 });
    return setSessionCookie(resp, user._id.toString());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
