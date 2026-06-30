import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/users-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = users.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role, status } = body;

    if (email && email.toLowerCase() !== users[userIndex].email.toLowerCase()) {
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    const updatedUser = {
      ...users[userIndex],
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(status !== undefined && { status }),
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users.splice(userIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
