"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Innstillinger</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Bedrift</h3>
          <div className="text-sm space-y-1 text-muted-foreground">
            <div>Navn: Acme ENK</div>
            <div>Org.nr: 987 654 321</div>
            <div>MVA-registrert: Ja</div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">Rediger bedriftsopplysninger</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Abonnement</h3>
          <div className="text-sm">Du er på <span className="font-medium">Pro</span> (149 kr/md)</div>
          <div className="text-xs text-muted-foreground mt-1">14-dagers prøveperiode aktiv til 12. februar 2026</div>
          <Button className="mt-4" variant="outline" size="sm">Administrer abonnement (Stripe)</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Data & Personvern</h3>
          <div className="text-sm text-muted-foreground">Alle data lagres i EU. Du kan når som helst eksportere eller slette alt.</div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm">Eksporter alle data (CSV + JSON)</Button>
            <Button variant="destructive" size="sm">Slett konto og alle data</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
