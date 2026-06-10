"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Rapporter</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg">MVA-rapport</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Automatisk beregnet utgående / inngående MVA for valgt periode.</p>
          <Link href="/reports/mva"><Button variant="outline" size="sm">Åpne MVA-rapport</Button></Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg">Forskuddsskatt</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Beregn nøyaktig forskuddsskatt for ENK basert på 2026-satser.</p>
          <Link href="/reports/forskuddsskatt"><Button size="sm">Åpne kalkulator</Button></Link>
        </Card>
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        Alle rapporter kan eksporteres som PDF og CSV, klare for Altinn / Skatteetaten.
      </div>
    </div>
  );
}
