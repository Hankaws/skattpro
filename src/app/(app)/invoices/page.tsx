"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function InvoicesPage() {
  const { toast } = useToast();

  // Demo data for now (in real version: fetch from /api/invoices)
  const invoices = [
    {
      id: "INV-482931",
      customer: "Kunde AS",
      total: "18 750 kr",
      status: "Sendt",
      dueDate: "15. feb 2026",
      paid: false,
    },
    {
      id: "INV-482912",
      customer: "Acme Consulting",
      total: "45 000 kr",
      status: "Betalt",
      dueDate: "28. jan 2026",
      paid: true,
    },
  ];

  const handleSendReminder = (id: string) => {
    toast({
      title: "Purring sendt",
      description: `Purring for ${id} er sendt via e-post. (Demo)`,
    });
  };

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

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-sm">
            <tr>
              <th className="p-4 font-medium">Fakturanr</th>
              <th className="p-4 font-medium">Kunde</th>
              <th className="p-4 font-medium">Beløp</th>
              <th className="p-4 font-medium">Forfall</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-sm">{inv.id}</td>
                <td className="p-4">{inv.customer}</td>
                <td className="p-4 font-medium">{inv.total}</td>
                <td className="p-4 text-sm text-muted-foreground">{inv.dueDate}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    inv.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {!inv.paid && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendReminder(inv.id)}
                    >
                      Send purring
                    </Button>
                  )}
                  <Link href="/invoices/new" className="ml-2">
                    <Button variant="ghost" size="sm">Vis</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground mt-4">
        Pro-tip: Bankimport kan automatisk matche betalinger mot åpne fakturaer og merke dem som betalt.
      </div>
    </div>
  );
}
