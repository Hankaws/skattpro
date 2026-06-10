"use client";

import { Card } from "@/components/ui/card";

export default function MvaReport() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">MVA-rapport</h1>
      <p className="text-muted-foreground mb-6">Periode: Januar 2026</p>

      <Card className="p-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Utgående MVA (25%)</div>
            <div className="text-3xl font-semibold mt-1">186 250 kr</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Inngående MVA</div>
            <div className="text-3xl font-semibold mt-1 text-emerald-600">67 400 kr</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Netto å betale</div>
            <div className="text-3xl font-semibold mt-1 text-primary-600">118 850 kr</div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Denne rapporten er klar for nedlasting som CSV eller PDF for innsending til Skatteetaten / Altinn.
        </div>
      </Card>
    </div>
  );
}
