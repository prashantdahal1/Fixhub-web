import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { DbUser } from "@/lib/db-user";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { _id: id as any };
    const user = await DbUser.findOne(query);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const mappedRole = user.role === "professional" ? "expert" : user.role;
    return NextResponse.json({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: mappedRole,
      status: user.status || "active",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { _id: id as any };
    const user = await DbUser.findOne(query);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role, status } = body;

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await DbUser.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) {
      const nameParts = name.trim().split(" ");
      user.firstName = nameParts[0];
      user.lastName = nameParts.slice(1).join(" ") || ".";
    }

    if (role !== undefined) {
      user.role = role === "expert" ? "professional" : role;
    }

    if (status !== undefined) {
      user.status = status;
    }

    await user.save();

    const mappedRole = user.role === "professional" ? "expert" : user.role;

    return NextResponse.json({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: mappedRole,
      status: user.status || "active",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { _id: id as any };
    const user = await DbUser.findOneAndDelete(query);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
