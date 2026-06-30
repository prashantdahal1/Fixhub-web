import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { DbUser } from "@/lib/db-user";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const search = searchParams.get("search") || "";

    if (isNaN(page) || page < 1 || isNaN(size) || size < 1) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
    }

    const query: any = {};
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { username: searchRegex }
      ];
    }

    const totalItems = await DbUser.countDocuments(query);
    const totalPages = Math.ceil(totalItems / size) || 1;
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * size;

    const dbUsers = await DbUser.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const formattedUsers = dbUsers.map((u) => {
      const mappedRole = u.role === "professional" ? "expert" : u.role;
      return {
        id: u._id.toString(),
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        role: mappedRole,
        status: u.status || "active",
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        username: u.username,
        phoneNumber: u.phoneNumber || ""
      };
    });

    return NextResponse.json({
      data: formattedUsers,
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
    await connectDB();
    const body = await request.json();
    const { name, email, role, status } = body;

    if (!name || !email || !role || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await DbUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || ".";
    const username = email.split("@")[0] + Math.floor(100 + Math.random() * 900);
    const hashedPassword = await bcrypt.hash("fixhub@123", 10);
    const dbRole = role === "expert" ? "professional" : role;

    const newUser = await DbUser.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
      role: dbRole,
      status,
      phoneNumber: ""
    });

    const mappedRole = newUser.role === "professional" ? "expert" : newUser.role;

    return NextResponse.json({
      id: newUser._id.toString(),
      name: `${newUser.firstName} ${newUser.lastName}`.trim(),
      email: newUser.email,
      role: mappedRole,
      status: newUser.status || "active",
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
