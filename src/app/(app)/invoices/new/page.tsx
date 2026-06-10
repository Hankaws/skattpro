"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function NewInvoice() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ 
      title: "Faktura opprettet (demo)", 
      description: "I ekte versjon vil dette generere PDF + sende e-post + lagre i databasen." 
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ny faktura</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Kundenavn</label>
            <Input placeholder="Kunde AS" defaultValue="Kunde AS" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">E-post</label>
              <Input type="email" defaultValue="faktura@kunde.no" />
            </div>
            <div>
              <label className="text-sm font-medium">Forfallsdato</label>
              <Input type="date" defaultValue="2026-02-15" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Beskrivelse</label>
            <Input defaultValue="Konsulenttjenester januar 2026" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Beløp eks. MVA</label>
              <Input defaultValue="15000" />
            </div>
            <div>
              <label className="text-sm font-medium">MVA-sats</label>
              <Input defaultValue="25%" />
            </div>
            <div>
              <label className="text-sm font-medium">Total</label>
              <Input value="18750 kr" disabled />
            </div>
          </div>

          <Button type="submit" className="w-full mt-4">Opprett og send faktura</Button>
        </form>
      </Card>
    </div>
  );
}
