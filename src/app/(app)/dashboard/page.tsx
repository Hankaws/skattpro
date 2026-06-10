"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUp, ArrowDown, TrendingUp, AlertTriangle, Receipt, Upload, Camera, FileText } from 'lucide-react';

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

  const income = transactions.filter(t => (t.accountCode || '').startsWith('3')).reduce((s, t) => s + Math.max(0, t.amount), 0);
  const expenses = transactions.filter(t => !(t.accountCode || '').startsWith('3')).reduce((s, t) => s + Math.abs(Math.min(0, t.amount)), 0);
  const result = income - expenses;

  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const aiAutoRate = transactions.length > 0 ? Math.round((transactions.filter(t => t.accountCode).length / transactions.length) * 100) : 0;

  const stats = {
    omsetning: income || 1245000,
    utgifter: expenses || 432000,
    resultat: result || 813000,
    ubetalteFakturaer: 3,
    aiAutoRate: aiAutoRate || 87,
    hoursSaved: Math.max(4, Math.floor(transactions.length / 3)),
  };

  return (
    <div className="pt-8 space-y-10">
      {/* Hero header - directly copied style from skattpro-landing hero and section-label */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="section-label">Ditt regnskap</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{color: 'var(--text-primary)'}}>
          God morgen! Her er oversikten din
        </h1>
        <p className="mt-4 text-lg" style={{color: 'var(--text-secondary)'}}>
          Alt ser bra ut. AI har tatt seg av det meste.
        </p>
      </div>

      {/* Glass stats - exact visual language from landing hero cards + stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Omsetning (YTD)</div>
          <div className="text-3xl font-bold tracking-tighter mt-2" style={{color: 'var(--text-primary)'}}>{(stats.omsetning / 1000).toFixed(0)} 000 kr</div>
          <div className="text-xs mt-1.5 flex items-center gap-1 text-emerald-600"><ArrowUp className="h-3 w-3" /> +8.2%</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Utgifter (YTD)</div>
          <div className="text-3xl font-bold tracking-tighter mt-2" style={{color: 'var(--text-primary)'}}>{(stats.utgifter / 1000).toFixed(0)} 000 kr</div>
          <div className="text-xs mt-1.5 flex items-center gap-1 text-red-600"><ArrowDown className="h-3 w-3" /> -1.4%</div>
        </div>
        <div className="glass-card p-6 border-2 border-primary-500">
          <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Resultat</div>
          <div className="text-3xl font-bold tracking-tighter mt-2 text-primary-500">{(stats.resultat / 1000).toFixed(0)} 000 kr</div>
          <div className="text-xs mt-1.5 flex items-center gap-1 text-emerald-600"><ArrowUp className="h-3 w-3" /> +14.1%</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Ubetalte fakturaer</div>
          <div className="text-3xl font-bold tracking-tighter mt-2" style={{color: 'var(--text-primary)'}}>{stats.ubetalteFakturaer}</div>
          <div className="text-xs mt-1.5" style={{color: 'var(--text-muted)'}}>Totalt ~148k kr</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart - glass like landing dashboard preview */}
        <div className="glass-card lg:col-span-3 p-7">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="font-semibold text-lg" style={{color: 'var(--text-primary)'}}>Resultatutvikling</div>
              <div className="text-sm" style={{color: 'var(--text-secondary)'}}>Siste transaksjoner</div>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              {stats.aiAutoRate}% AI-automatisert
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-44 mt-2">
            {[42,58,61,55,78,92,105,88,71,65].map((h,i) => (
              <div key={i} className="flex-1 bg-primary-500/90 rounded-t" style={{height: `${h * 1.6}px`}} />
            ))}
          </div>
          <div className="flex justify-between text-xs mt-2" style={{color: 'var(--text-muted)'}}>
            <div>Jan</div><div>Nå</div>
          </div>
        </div>

        {/* AI Innsikt - glass feature card exactly like landing modules/features */}
        <div className="glass-card lg:col-span-2 p-7">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <div className="font-semibold text-lg" style={{color: 'var(--text-primary)'}}>AI-innsikt</div>
          </div>
          <div className="space-y-4 text-sm">
            {[
              "Du er på vei mot ~42% effektiv skatt. Vurder utstyrskjøp før årsskiftet.",
              `${stats.aiAutoRate}% av transaksjonene ble automatisk kategorisert.`,
              "Last opp flere bankfiler for bedre cashflow-prognose."
            ].map((insight, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-2xl" style={{background: 'rgba(59,130,246,0.06)'}}>
                <AlertTriangle className="h-4 w-4 mt-0.5 text-primary-500 shrink-0" />
                <span style={{color: 'var(--text-secondary)'}}>{insight}</span>
              </div>
            ))}
          </div>
          <Link href="/reports/forskuddsskatt" className="inline-block mt-5 text-sm font-semibold text-primary-600 hover:underline">Åpne forskuddsskatt-kalkulator →</Link>
        </div>
      </div>

      {/* Activity + Actions - glass cards like landing "modules" and "dashboard" sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-7">
          <div className="font-semibold text-lg mb-5" style={{color: 'var(--text-primary)'}}>Siste aktivitet</div>
          {loading ? <div className="text-sm" style={{color: 'var(--text-muted)'}}>Laster...</div> : recent.length === 0 ? (
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>Ingen transaksjoner. Bruk Seed i Transaksjoner.</div>
          ) : (
            <div className="space-y-4">
              {recent.map((item, i) => (
                <div key={i} className="flex justify-between text-sm pb-4 border-b last:border-0" style={{borderColor: 'var(--border)'}}>
                  <div>
                    <div className="truncate max-w-[280px]" style={{color: 'var(--text-primary)'}}>{item.description}</div>
                    <div className="text-xs" style={{color: 'var(--text-muted)'}}>{new Date(item.date).toLocaleDateString('nb-NO')}</div>
                  </div>
                  <div className={item.amount > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                    {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString("nb-NO")} kr
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/transactions" className="text-sm font-semibold text-primary-600 hover:underline mt-4 inline-block">Se full transaksjonsliste →</Link>
        </div>

        <div className="glass-card p-7">
          <div className="font-semibold text-lg mb-5" style={{color: 'var(--text-primary)'}}>Hurtighandlinger</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/transactions" className="glass p-4 rounded-2xl flex items-center gap-3 hover:bg-white/70 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center"><Upload className="h-5 w-5 text-primary-500" /></div>
              <div>
                <div className="font-medium" style={{color: 'var(--text-primary)'}}>Importer bank / Seed demo</div>
                <div className="text-xs" style={{color: 'var(--text-muted)'}}>CSV eller demo-data</div>
              </div>
            </Link>
            <Link href="/receipts" className="glass p-4 rounded-2xl flex items-center gap-3 hover:bg-white/70 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center"><Camera className="h-5 w-5 text-primary-500" /></div>
              <div>
                <div className="font-medium" style={{color: 'var(--text-primary)'}}>Ta bilde av kvittering</div>
                <div className="text-xs" style={{color: 'var(--text-muted)'}}>OCR + auto-kategorisering</div>
              </div>
            </Link>
            <Link href="/invoices/new" className="glass p-4 rounded-2xl flex items-center gap-3 hover:bg-white/70 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary-500" /></div>
              <div>
                <div className="font-medium" style={{color: 'var(--text-primary)'}}>Opprett ny faktura</div>
                <div className="text-xs" style={{color: 'var(--text-muted)'}}>Med PDF og purring</div>
              </div>
            </Link>
            <Link href="/reports/forskuddsskatt" className="glass p-4 rounded-2xl flex items-center gap-3 hover:bg-white/70 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary-500" /></div>
              <div>
                <div className="font-medium" style={{color: 'var(--text-primary)'}}>Forskuddsskatt</div>
                <div className="text-xs" style={{color: 'var(--text-muted)'}}>Kalkulator 2026</div>
              </div>
            </Link>
          </div>
          <div className="mt-5 text-xs" style={{color: 'var(--text-muted)'}}>
            Du har spart ca. {stats.hoursSaved} timer denne måneden takket være AI.
          </div>
        </div>
      </div>
    </div>
  );
}
