import { NextRequest, NextResponse } from "next/server";
import { users, User } from "@/lib/users-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const search = searchParams.get("search") || "";

    if (isNaN(page) || page < 1 || isNaN(size) || size < 1) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
    }

    let filtered = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / size) || 1;
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * size;
    const paginated = filtered.slice(startIndex, startIndex + size);

    return NextResponse.json({
      data: paginated,
      meta: {
        totalItems,
        totalPages,
        currentPage,
        pageSize: size
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, status } = body;

    if (!name || !email || !role || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
