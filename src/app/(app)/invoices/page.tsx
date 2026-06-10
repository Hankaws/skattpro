"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function InvoicesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Faktura</h1>
          <p className="text-muted-foreground">Send profesjonelle fakturaer med EHF-støtte (kommer snart)</p>
        </div>
        <Link href="/invoices/new">
          <Button>Opprett ny faktura</Button>
        </Link>
      </div>

      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Ingen fakturaer ennå.</p>
        <Link href="/invoices/new" className="mt-4 inline-block">
          <Button variant="outline">Opprett din første faktura</Button>
        </Link>
      </Card>

      <div className="text-xs text-muted-foreground mt-8">
        Pro-tip: Når du importerer bankbetalinger, foreslår vi automatisk faktura basert på tidligere kunder.
      </div>
    </div>
  );
}
