import { NextResponse } from "next/server";
import { RegisterUserSchema } from "@/backend/shared/dtos/auth.dto";
import { prisma } from "@/backend/prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = RegisterUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Create organization and user
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.companyName,
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          orgId: org.id,
          role: "ADMIN", // First user is ADMIN
        },
      });

      return { user, org };
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
