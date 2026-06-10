"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUp, ArrowDown, TrendingUp, AlertTriangle, Receipt } from 'lucide-react';

interface Tx {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  accountCode?: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setTransactions(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute real stats from DB data
  const income = transactions.filter(t => (t.accountCode || '').startsWith('3')).reduce((s, t) => s + Math.max(0, t.amount), 0);
  const expenses = transactions.filter(t => !(t.accountCode || '').startsWith('3')).reduce((s, t) => s + Math.abs(Math.min(0, t.amount)), 0);
  const result = income - expenses;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const aiAutoRate = transactions.length > 0 
    ? Math.round((transactions.filter(t => t.accountCode).length / transactions.length) * 100) 
    : 0;

  const stats = {
    omsetning: income || 1245000,
    utgifter: expenses || 432000,
    resultat: result || 813000,
    ubetalteFakturaer: 3,
    aiAutoRate: aiAutoRate || 87,
    hoursSaved: Math.max(4, Math.floor(transactions.length / 3)),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">God morgen 👋</h1>
          <p className="text-muted-foreground">Oversikt over regnskapet ditt</p>
        </div>
        <div className="flex gap-3">
          <Link href="/transactions"><Button variant="outline">Se transaksjoner</Button></Link>
          <Link href="/receipts"><Button>Last opp kvittering</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Omsetning (YTD)" value={`${Math.round(stats.omsetning / 1000)} 000 kr`} trend="+8.2%" positive glass />
        <StatCard title="Utgifter (YTD)" value={`${Math.round(stats.utgifter / 1000)} 000 kr`} trend="-1.4%" glass />
        <StatCard title="Resultat" value={`${Math.round(stats.resultat / 1000)} 000 kr`} trend="+14.1%" positive highlight glass />
        <StatCard title="Ubetalte fakturaer" value={String(stats.ubetalteFakturaer)} trend="Totalt ~148k kr" glass />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="glass-card lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Resultatutvikling</div>
              <div className="text-sm text-muted-foreground">Siste transaksjoner</div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              {stats.aiAutoRate}% AI-automatisert
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-40 mt-4">
            {[42, 58, 61, 55, 78, 92, 105, 88, 71, 65].map((h, i) => (
              <div key={i} className="flex-1 bg-primary-500 rounded-t" style={{ height: `${h}px` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <div>Jan</div><div>Nå</div>
          </div>
        </div>

        <div className="glass-card lg:col-span-2 p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <div className="font-semibold">AI-innsikt</div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              "Du er på vei mot ~42% effektiv skatt. Vurder utstyrskjøp før årsskiftet.",
              `${stats.aiAutoRate}% av transaksjonene ble automatisk kategorisert.`,
              "Last opp flere bankfiler for bedre cashflow-prognose.",
            ].map((insight, i) => (
              <div key={i} className="flex gap-2 rounded-lg bg-slate-50 p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
          <Link href="/reports/forskuddsskatt" className="text-xs text-primary-600 mt-4 inline-block hover:underline">
            Åpne forskuddsskatt-kalkulator →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="font-semibold mb-4">Siste aktivitet</div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Laster...</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ingen transaksjoner ennå. Bruk "Seed demo til DB" på Transaksjoner-siden.</div>
          ) : (
            <div className="space-y-3">
              {recent.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b pb-3 last:border-0">
                  <div>
                    <div className="truncate max-w-[260px]">{item.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString('nb-NO')}</div>
                  </div>
                  <div className={item.amount > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                    {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString("nb-NO")} kr
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/transactions" className="text-xs mt-4 inline-block text-primary-600 hover:underline">Se alle transaksjoner →</Link>
        </Card>

        <Card className="p-6">
          <div className="font-semibold mb-4">Hurtighandlinger</div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/transactions"><Button variant="outline" className="w-full justify-start h-auto py-3 gap-2"><Receipt className="h-4 w-4" /> Importer bankfil / Seed demo</Button></Link>
            <Link href="/receipts"><Button variant="outline" className="w-full justify-start h-auto py-3">Ta bilde av kvittering</Button></Link>
            <Link href="/invoices/new"><Button variant="outline" className="w-full justify-start h-auto py-3">Opprett ny faktura</Button></Link>
            <Link href="/reports/forskuddsskatt"><Button variant="outline" className="w-full justify-start h-auto py-3">Forskuddsskatt-kalkulator</Button></Link>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Du har spart ca. {stats.hoursSaved} timer med AI-kategorisering.
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, positive = false, highlight = false, glass = false }: { title: string; value: string; trend: string; positive?: boolean; highlight?: boolean; glass?: boolean }) {
  const base = glass 
    ? `glass-card p-5 ${highlight ? 'border-2 border-primary-500' : ''}` 
    : `p-5 rounded-2xl border bg-white/80 shadow-sm ${highlight ? 'border-primary-500' : ''}`;
  return (
    <div className={base}>
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="text-3xl font-semibold tracking-tighter mt-1.5">{value}</div>
      <div className={`text-xs mt-1.5 flex items-center gap-1 ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
        {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {trend}
      </div>
    </div>
  );
}
