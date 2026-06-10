"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { categorizeBatch, getConfidenceColor, type CategorizationResult, type TransactionInput } from '@/lib/ai/categorizer';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Upload, Play, Save, RefreshCw, Database } from 'lucide-react';

interface TxRow extends TransactionInput {
  id: string;
  result?: CategorizationResult;
  isSaved?: boolean;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load from DB on mount
  useEffect(() => {
    loadFromServer();
  }, []);

  async function loadFromServer() {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        const rows: TxRow[] = data.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          description: t.description,
          date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
          merchant: t.merchant || '',
          result: t.accountCode ? {
            accountCode: t.accountCode,
            category: t.category || '',
            vatCode: t.vatCode || 'H1',
            confidence: t.aiConfidence || 0.8,
            explanation: t.aiExplanation || '',
            method: t.aiMethod || 'manual',
          } : undefined,
          isSaved: true,
        }));
        setTransactions(rows);
      }
    } catch (e) {
      // DB not ready yet — that's ok for early dev
    }
    setLoading(false);
  }

  // Demo data using real Norwegian examples
  const loadDemoData = async () => {
    const demo: TransactionInput[] = [
      { id: 'd1', amount: -2499, description: 'APPLE STORE APPLE.COM/BILL', date: '2026-01-12' },
      { id: 'd2', amount: 18500, description: 'VIPPS BEDRIFT BETALING FRA KUNDE AS', date: '2026-01-11' },
      { id: 'd3', amount: -890, description: 'VY 12345678 OSLO - BERGEN', date: '2026-01-10' },
      { id: 'd4', amount: -1250, description: 'SHELL STASJON 4521 DRIVSTOFF', date: '2026-01-09' },
      { id: 'd5', amount: 8750, description: 'STRIPE PAYOUT - KUNDEPROSJEKT', date: '2026-01-08' },
      { id: 'd6', amount: -420, description: 'MENY STAVANGER - MØTE MAT', date: '2026-01-07' },
      { id: 'd7', amount: -1890, description: 'SCANDIC HOTEL BERGEN', date: '2026-01-05' },
      { id: 'd8', amount: -299, description: 'GOOGLE ADS - JANUAR KAMPANJE', date: '2026-01-04' },
    ];

    const categorized = await categorizeBatch(demo);
    const rows: TxRow[] = demo.map((tx, i) => ({
      ...tx,
      id: `demo-${i}`,
      result: categorized[i],
    }));

    setTransactions(rows);
    setFileName('Demo data (8 transaksjoner)');
    toast({ title: 'Demo lastet', description: 'AI har kategorisert 8 vanlige norske transaksjoner. Trykk "Lagre alle" for å lagre i databasen.' });
  };

  // Seed real demo data (server-side, clean)
  const seedDemoToDb = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Seed failed');
      await loadFromServer();
      toast({ title: 'Demo-data lagt til i databasen!', description: 'Flere transaksjoner med full AI-kategorisering er nå lagret.' });
    } catch (e) {
      toast({ title: 'Kunne ikke seed', description: 'Sjekk DATABASE_URL i .env.local og kjør prisma db push.', variant: 'destructive' });
    }
    setIsProcessing(false);
  };

  // CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsed = (results.data as any[])
            .filter((row: any) => row.Beløp || row.Amount || row.amount)
            .map((row: any, index: number) => {
              const amountStr = row.Beløp || row.Amount || row.amount || '0';
              const amount = parseFloat(String(amountStr).replace(',', '.').replace(/\s/g, '')) || 0;
              return {
                id: `csv-${index}`,
                amount,
                description: row.Beskrivelse || row.Description || row.Tekst || row['Transaksjonstekst'] || 'Ukjent',
                date: row.Dato || row.Date || row['Bokføringsdato'] || new Date().toISOString().split('T')[0],
                merchant: row.Mottaker || row.Merchant || '',
              } as TransactionInput;
            });

          const categorized = await categorizeBatch(parsed);
          const rows: TxRow[] = parsed.map((tx, i) => ({
            ...tx,
            id: tx.id || `csv-${i}`,
            result: categorized[i],
          }));

          setTransactions(rows);
          toast({
            title: `${rows.length} transaksjoner importert`,
            description: 'Kategorier foreslått av AI. Rediger og lagre.',
          });
        } catch (err) {
          toast({ title: 'Feil ved parsing', description: 'Sjekk CSV-formatet.', variant: 'destructive' });
        } finally {
          setIsProcessing(false);
        }
      },
    });
    e.target.value = '';
  };

  const runCategorization = async () => {
    if (transactions.length === 0) return;
    setIsProcessing(true);
    const inputs = transactions.map((t) => ({ amount: t.amount, description: t.description, date: t.date }));
    const results = await categorizeBatch(inputs);
    const updated = transactions.map((tx, i) => ({ ...tx, result: results[i] }));
    setTransactions(updated);
    setIsProcessing(false);
    toast({ title: 'AI oppdatert' });
  };

  const updateRow = (id: string, field: 'category' | 'accountCode' | 'vatCode', value: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id || !tx.result) return tx;
        return {
          ...tx,
          result: {
            ...tx.result,
            [field]: value,
            confidence: Math.min(tx.result.confidence || 0.7, 0.65),
            method: 'manual',
          },
        };
      })
    );
  };

  // Real save to DB
  const saveToLedger = async (onlyUnsaved = true) => {
    const toSave = transactions.filter((t) => !onlyUnsaved || !t.isSaved);
    if (toSave.length === 0) return;

    setIsProcessing(true);
    let savedCount = 0;

    for (const tx of toSave) {
      if (!tx.result) continue;
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: tx.amount,
            description: tx.description,
            date: tx.date,
            merchant: tx.merchant,
            aiResult: tx.result,
          }),
        });
        if (res.ok) savedCount++;
      } catch (e) {}
    }

    await loadFromServer();
    setIsProcessing(false);

    toast({
      title: `${savedCount} transaksjoner lagret`,
      description: 'Nå synlige i dashboard og rapporter.',
    });
  };

  const totalIncome = transactions
    .filter((t) => (t.result?.accountCode || '').startsWith('3'))
    .reduce((s, t) => s + Math.max(0, t.amount), 0);
  const totalExpense = transactions
    .filter((t) => !(t.result?.accountCode || '').startsWith('3'))
    .reduce((s, t) => s + Math.abs(Math.min(0, t.amount)), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksjoner</h1>
          <p className="text-muted-foreground mt-1">Importer bankutskrift → AI kategoriserer → lagre som bilag</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={seedDemoToDb} disabled={isProcessing}>
            <Database className="mr-2 h-4 w-4" /> Seed demo til DB
          </Button>
          <Button variant="outline" onClick={loadDemoData}>
            <RefreshCw className="mr-2 h-4 w-4" /> Last demo (preview)
          </Button>

          <label>
            <Button variant="outline" asChild>
              <span><Upload className="mr-2 h-4 w-4" /> Last opp CSV</span>
            </Button>
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>

          <Button onClick={runCategorization} disabled={transactions.length === 0 || isProcessing}>
            <Play className="mr-2 h-4 w-4" /> Kjør AI
          </Button>

          <Button onClick={() => saveToLedger(true)} disabled={transactions.length === 0 || isProcessing}>
            <Save className="mr-2 h-4 w-4" /> Lagre til regnskap
          </Button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="text-sm text-muted-foreground">Rader</div>
            <div className="text-2xl font-semibold">{transactions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">{fileName || 'Lokal + DB'}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-muted-foreground">Inntekter (AI)</div>
            <div className="text-2xl font-semibold text-emerald-600">{totalIncome.toLocaleString('nb-NO')} kr</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-muted-foreground">Utgifter (AI)</div>
            <div className="text-2xl font-semibold text-red-600">{totalExpense.toLocaleString('nb-NO')} kr</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Laster fra database...</div>
      ) : transactions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-primary-500" />
          </div>
          <h3 className="font-semibold text-lg">Ingen transaksjoner</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            Last opp CSV eller seed demo-data direkte til databasen. AI-en kjenner igjen vanlige norske betalingsmønstre.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={seedDemoToDb}>Seed demo til DB</Button>
            <Button variant="outline" onClick={loadDemoData}>Last demo (preview)</Button>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dato</TableHead>
                <TableHead>Beskrivelse</TableHead>
                <TableHead className="text-right">Beløp</TableHead>
                <TableHead>Konto</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>MVA</TableHead>
                <TableHead>Konfidens</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const res = tx.result;
                return (
                  <TableRow key={tx.id} className={tx.isSaved ? 'bg-emerald-50/40' : ''}>
                    <TableCell className="font-mono text-sm">{tx.date ? new Date(tx.date).toLocaleDateString('nb-NO') : ''}</TableCell>
                    <TableCell className="max-w-[320px] truncate">{tx.description}</TableCell>
                    <TableCell className={`text-right font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {tx.amount.toLocaleString('nb-NO')} kr
                    </TableCell>
                    <TableCell>
                      <input className="w-16 font-mono border rounded px-1 py-0.5 text-sm" value={res?.accountCode || ''} onChange={(e) => updateRow(tx.id, 'accountCode', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <input className="w-full max-w-[220px] border rounded px-2 py-1 text-sm" value={res?.category || ''} onChange={(e) => updateRow(tx.id, 'category', e.target.value)} />
                    </TableCell>
                    <TableCell><Badge variant="outline" className="font-mono text-xs">{res?.vatCode || 'H1'}</Badge></TableCell>
                    <TableCell>
                      {res && <Badge className={`font-mono text-xs border ${getConfidenceColor(res.confidence)}`}>{(res.confidence * 100).toFixed(0)}%</Badge>}
                    </TableCell>
                    <TableCell>
                      {tx.isSaved ? <Badge className="bg-emerald-600">Lagret</Badge> : <Button size="sm" variant="ghost" onClick={() => saveToLedger(false)}>Lagre</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="p-4 border-t flex justify-between text-sm text-muted-foreground">
            <div>AI basert på 50+ norske regler • Rediger for å overstyre</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={runCategorization} disabled={isProcessing}>Kjør AI på nytt</Button>
              <Button size="sm" onClick={() => saveToLedger(false)} disabled={isProcessing}>Lagre alle</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground">
        Tips: Bruk "Seed demo til DB" for å fylle databasen med ekte eksempler. Deretter kan du redigere og lagre.
      </div>
    </div>
  );
}
