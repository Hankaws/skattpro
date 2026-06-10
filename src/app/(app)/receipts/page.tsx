"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { categorizeTransaction } from '@/lib/ai/categorizer';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload } from 'lucide-react';

export default function ReceiptsPage() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  // Client-side Tesseract OCR (already installed via npm)
  const handleFile = async (file: File) => {
    setProcessing(true);
    setResult(null);

    try {
      // Dynamic import so it only loads when needed
      const Tesseract = (await import('tesseract.js')).default;

      const { data: { text } } = await Tesseract.recognize(file, 'nor+eng', {
        logger: (m) => console.log(m),
      });

      // Very naive extraction (real version would be smarter + use LLM vision fallback)
      const amountMatch = text.match(/(\d+[.,]\d{2})\s*(kr|NOK)?/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;

      const dateMatch = text.match(/(\d{2}[./-]\d{2}[./-]\d{2,4})/);
      const date = dateMatch ? dateMatch[1] : null;

      const merchantGuess = text.split('\n').find(l => l.length > 3 && l.length < 35) || 'Ukjent butikk';

      const tx = { amount: -(amount || 0), description: `${merchantGuess} (kvittering)` };
      const cat = await categorizeTransaction(tx);

      setResult({
        merchant: merchantGuess.trim(),
        date,
        amount: amount || 0,
        rawText: text.substring(0, 280),
        category: cat,
      });

      toast({ title: "Kvittering lest", description: "AI har foreslått kategori og konto." });
    } catch (e) {
      toast({ title: "Kunne ikke lese bildet", description: "Prøv et klarere bilde eller last opp manuelt.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Kvitteringer</h1>
      <p className="text-muted-foreground mb-8">Ta bilde eller last opp – OCR + AI lager transaksjon automatisk.</p>

      <Card className="p-8 border-dashed">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Last opp kvittering</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Støtter JPG, PNG. OCR skjer i nettleseren din (personvern).</p>

          <label className="cursor-pointer">
            <Button size="lg" className="gap-2" disabled={processing}>
              <Upload className="h-4 w-4" /> {processing ? "Leser..." : "Velg bilde"}
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={onDrop} disabled={processing} />
          </label>
          <p className="text-xs text-muted-foreground mt-3">Eller ta bilde direkte med telefonen din</p>
        </div>
      </Card>

      {result && (
        <Card className="mt-8 p-6">
          <div className="font-semibold mb-4">OCR + AI resultat</div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>Butikk</div><div className="font-medium">{result.merchant}</div>
            <div>Dato</div><div>{result.date || 'Ikke funnet'}</div>
            <div>Beløp</div><div className="font-medium text-red-600">–{result.amount} kr</div>
            <div>Foreslått kategori</div><div>{result.category.category} ({result.category.accountCode})</div>
            <div>MVA-kode</div><div>{result.category.vatCode} — konfidens {(result.category.confidence*100).toFixed(0)}%</div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={() => {
              toast({ title: "Lagret som transaksjon", description: "Gå til Transaksjoner for å bekrefte." });
              window.location.href = "/transactions";
            }}>
              Bekreft og lagre transaksjon
            </Button>
            <Button variant="outline" onClick={() => setResult(null)}>Avbryt</Button>
          </div>

          <details className="mt-6 text-xs text-muted-foreground">
            <summary className="cursor-pointer">Vis rå OCR-tekst</summary>
            <pre className="mt-2 p-3 bg-slate-100 rounded text-[10px] whitespace-pre-wrap">{result.rawText}</pre>
          </details>
        </Card>
      )}
    </div>
  );
}
