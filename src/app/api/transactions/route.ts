import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { categorizeTransaction } from "@/lib/ai/categorizer";

// Helper: get or create default company for the user (fast path for MVP)
async function getDefaultCompany(userId: string) {
  let company = await prisma.company.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        userId,
        name: "Min ENK",
        type: "ENK",
        vatRegistered: true,
      },
    });

    await prisma.subscription.create({
      data: {
        companyId: company.id,
        plan: "pro",
        status: "trialing",
        trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
    });
  }
  return company;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await getDefaultCompany(session.user.id);

  const transactions = await prisma.transaction.findMany({
    where: { companyId: company.id },
    orderBy: { date: "desc" },
    take: 300,
    include: { receipt: true },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  const company = await getDefaultCompany(session.user.id);

  // If no categorization result was sent, run it server-side as fallback
  let cat = data.aiResult;
  if (!cat) {
    const result = await categorizeTransaction({
      amount: data.amount,
      description: data.description,
    });
    cat = result;
  }

  const tx = await prisma.transaction.create({
    data: {
      companyId: company.id,
      date: new Date(data.date || Date.now()),
      amount: data.amount,
      description: data.description,
      merchant: data.merchant || null,
      accountCode: cat.accountCode || data.accountCode || null,
      category: cat.category || data.category || null,
      vatCode: cat.vatCode || data.vatCode || null,
      vatRate: cat.vatRate || data.vatRate || null,
      vatAmount: data.vatAmount || null,
      aiConfidence: cat.confidence || null,
      aiMethod: cat.method || "manual",
      aiExplanation: cat.explanation || null,
      isReconciled: false,
    },
  });

  return NextResponse.json(tx, { status: 201 });
}
