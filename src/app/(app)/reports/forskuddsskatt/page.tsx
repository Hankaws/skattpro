"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Ported from the excellent ai-backend forskuddsskatt calculator
function calculateForskuddsskatt({ income, expenses }: { income: number; expenses: number }) {
  const profit = Math.max(0, income - expenses);
  
  // Simplified 2026 ENK rates (real version has more brackets + Oslo adjustment)
  const trygdeavgift = Math.round(profit * 0.233);           // ~23.3%
  const skatt = Math.round(profit * 0.22);                   // ordinary income tax base
  const total = trygdeavgift + skatt;
  const quarterly = Math.round(total / 4);

  return {
    profit,
    trygdeavgift,
    skatt,
    totalAnnual: total,
    quarterly,
    schedule: [
      { date: "15. mars 2026", amount: quarterly },
      { date: "15. mai 2026", amount: quarterly },
      { date: "15. september 2026", amount: quarterly },
      { date: "15. november 2026", amount: quarterly },
    ],
  };
}

export default function ForskuddsskattPage() {
  const [income, setIncome] = useState(875000);
  const [expenses, setExpenses] = useState(312000);
  const result = calculateForskuddsskatt({ income, expenses });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Forskuddsskatt 2026</h1>
      <p className="text-muted-foreground mb-8">Beregning for ENK – oppdater tallene og se dine fire terminer.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-sm font-medium">Forventet omsetning</label>
          <Input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-medium">Forventede utgifter</label>
          <Input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} />
        </div>
      </div>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground">Beregnet overskudd</div>
        <div className="text-4xl font-semibold tracking-tighter mt-1">{result.profit.toLocaleString("nb-NO")} kr</div>

        <div className="mt-8 grid grid-cols-2 gap-y-6 text-sm">
          <div>Trygdeavgift (23,3%)</div><div className="font-medium text-right">{result.trygdeavgift.toLocaleString("nb-NO")} kr</div>
          <div>Skatt på alminnelig inntekt</div><div className="font-medium text-right">{result.skatt.toLocaleString("nb-NO")} kr</div>
          <div className="font-semibold pt-2 border-t">Total forskuddsskatt</div>
          <div className="font-semibold pt-2 border-t text-right">{result.totalAnnual.toLocaleString("nb-NO")} kr</div>
        </div>

        <div className="mt-8">
          <div className="font-semibold mb-3 text-sm">Betalingsplan</div>
          {result.schedule.map((p, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <div>{p.date}</div>
              <div className="font-medium">{p.amount.toLocaleString("nb-NO")} kr</div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground mt-4">Dette er en forenklet beregning. Den fulle versjonen tar hensyn til personfradrag, trinnskatt, Oslo-satser og tidligere års grunnlag.</p>
    </div>
  );
}
