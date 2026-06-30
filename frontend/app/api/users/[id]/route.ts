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
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: new mongoose.Types.ObjectId(id) } : { _id: id as any };
    console.log("Next route GET user query:", query);
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
      updatedAt: user.updatedAt.toISOString(),
      username: user.username || "",
      phoneNumber: user.phoneNumber || "",
      profilePicture: user.profilePicture || "",
      address: user.address || ""
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: new mongoose.Types.ObjectId(id) } : { _id: id as any };
    const user = await DbUser.findOne(query);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let firstName, lastName, email, username, role, status, phoneNumber, profilePicture, address;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      firstName = formData.get("firstName")?.toString();
      lastName = formData.get("lastName")?.toString();
      email = formData.get("email")?.toString();
      username = formData.get("username")?.toString();
      role = formData.get("role")?.toString();
      status = formData.get("status")?.toString();
      phoneNumber = formData.get("phoneNumber")?.toString();
      address = formData.get("address")?.toString();

      const file = formData.get("avatar") as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        profilePicture = `data:${file.type};base64,${base64String}`;
      }
    } else {
      const body = await request.json();
      firstName = body.firstName;
      lastName = body.lastName;
      email = body.email;
      username = body.username;
      role = body.role;
      status = body.status;
      phoneNumber = body.phoneNumber;
      profilePicture = body.profilePicture;
      address = body.address;
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await DbUser.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    if (username && username !== user.username) {
      const existingUsername = await DbUser.findOne({ username });
      if (existingUsername) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }
      user.username = username;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (address !== undefined) user.address = address;

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
      updatedAt: user.updatedAt.toISOString(),
      username: user.username || "",
      phoneNumber: user.phoneNumber || "",
      profilePicture: user.profilePicture || "",
      address: user.address || ""
    }, { status: 200 });
  } catch (error) {
    console.error("PUT User Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: new mongoose.Types.ObjectId(id) } : { _id: id as any };
    const user = await DbUser.findOneAndDelete(query);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
