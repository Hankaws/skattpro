import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companies = await prisma.company.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(companies);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  const company = await prisma.company.create({
    data: {
      userId: session.user.id,
      name: payload.name,
      orgNumber: payload.orgNumber ?? null,
      type: payload.type ?? "ENK",
      address: payload.address ?? null,
      city: payload.city ?? null,
      postalCode: payload.postalCode ?? null,
      country: payload.country ?? "NO",
      vatNumber: payload.vatNumber ?? null,
    },
  });
  return NextResponse.json(company, { status: 201 });
}
