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
        username: u.username || "",
        phoneNumber: u.phoneNumber || "",
        profilePicture: u.profilePicture || "",
        address: u.address || ""
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
    
    let firstName, lastName, email, username, role, status, phoneNumber, profilePicture = "", address = "";
    
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
      address = formData.get("address")?.toString() || "";
      
      const file = formData.get("avatar") as File | null;
      if (file && file.size > 0) {
        // Read file stream and encode to base64 data URI to keep self-contained inside DB user avatar,
        // which avoids storing/mounting difficulties in separate uploads dir across NextJS vs Express backend.
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
      profilePicture = body.profilePicture || "";
      address = body.address || "";
    }

    if (!firstName || !lastName || !email || !role || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingEmail = await DbUser.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const newUsername = username || email.split("@")[0] + Math.floor(100 + Math.random() * 900);
    const existingUsername = await DbUser.findOne({ username: newUsername });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("fixhub@123", 10);
    const dbRole = role === "expert" ? "professional" : role;

    const newUser = await DbUser.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username: newUsername,
      password: hashedPassword,
      role: dbRole,
      status,
      phoneNumber: phoneNumber || "",
      profilePicture: profilePicture || "",
      address: address || ""
    });

    const mappedRole = newUser.role === "professional" ? "expert" : newUser.role;

    return NextResponse.json({
      id: newUser._id.toString(),
      name: `${newUser.firstName} ${newUser.lastName}`.trim(),
      email: newUser.email,
      role: mappedRole,
      status: newUser.status || "active",
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
      username: newUser.username,
      phoneNumber: newUser.phoneNumber,
      profilePicture: newUser.profilePicture,
      address: newUser.address || ""
    }, { status: 201 });
  } catch (error) {
    console.error("POST User Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
