import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorizeTransaction } from "@/lib/ai/categorizer";
import { NextResponse } from "next/server";

// Quick demo seed for the current user's first company
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find or create company
  let company = await prisma.company.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } });
  if (!company) {
    company = await prisma.company.create({
      data: { userId: session.user.id, name: "Min ENK", type: "ENK", vatRegistered: true },
    });
  }

  const demo = [
    { amount: -2499, description: "APPLE STORE APPLE.COM/BILL", date: "2026-01-12" },
    { amount: 18500, description: "VIPPS BEDRIFT BETALING FRA KUNDE AS", date: "2026-01-11" },
    { amount: -890, description: "VY 12345678 OSLO - BERGEN", date: "2026-01-10" },
    { amount: -1250, description: "SHELL STASJON 4521 DRIVSTOFF", date: "2026-01-09" },
    { amount: 8750, description: "STRIPE PAYOUT - KUNDEPROSJEKT", date: "2026-01-08" },
    { amount: -420, description: "MENY STAVANGER - MØTE MAT", date: "2026-01-07" },
    { amount: -1890, description: "SCANDIC HOTEL BERGEN", date: "2026-01-05" },
  ];

  const created = [];
  for (const d of demo) {
    const cat = await categorizeTransaction(d);
    const tx = await prisma.transaction.create({
      data: {
        companyId: company.id,
        date: new Date(d.date),
        amount: d.amount,
        description: d.description,
        accountCode: cat.accountCode,
        category: cat.category,
        vatCode: cat.vatCode,
        vatRate: cat.vatRate || 0.25,
        aiConfidence: cat.confidence,
        aiMethod: cat.method,
        aiExplanation: cat.explanation,
      },
    });
    created.push(tx);
  }

  return NextResponse.json({ created: created.length, company: company.name });
}
