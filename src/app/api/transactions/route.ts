import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: data.type ?? "expense",
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      category: data.category ?? null,
      vatCode: data.vatCode ?? null,
      vatRate: data.vatRate ? parseFloat(data.vatRate) : null,
      vatAmount: data.vatAmount ? parseFloat(data.vatAmount) : null,
      tags: data.tags ? [...data.tags] : [],
    },
  });
  return NextResponse.json(transaction, { status: 201 });
}
