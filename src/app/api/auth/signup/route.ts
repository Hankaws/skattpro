import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: hashed,
      },
    });

    // Auto-create default company (ENK) for fast onboarding
    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: `${name || "Min"} ENK`,
        orgNumber: null,
        type: "ENK",
        vatRegistered: true,
      },
    });

    // Create trial subscription (Pro plan, 14 days)
    await prisma.subscription.create({
      data: {
        companyId: company.id,
        plan: "pro",
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
