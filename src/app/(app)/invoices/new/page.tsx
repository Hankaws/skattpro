"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoices/InvoicePDF';

export default function NewInvoice() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "Kunde AS",
    customerEmail: "faktura@kunde.no",
    customerOrgNr: "912 345 678",
    description: "Konsulenttjenester januar 2026",
    amountExVat: 15000,
    vatRate: 25,
    dueDate: "2026-02-15",
  });

  const total = Math.round(form.amountExVat * (1 + form.vatRate / 100));
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const issueDate = new Date().toISOString().split('T')[0];

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const generateAndDownloadPDF = async () => {
    try {
      const blob = await pdf(
        <InvoicePDF
          data={{
            invoiceNumber,
            issueDate,
            dueDate: form.dueDate,
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerOrgNr: form.customerOrgNr,
            description: form.description,
            amountExVat: form.amountExVat,
            vatRate: form.vatRate,
            total,
            sellerName: "Demo AS",
            sellerOrgNr: "987 654 321",
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF generert",
        description: `${invoiceNumber}.pdf lastet ned. I produksjon lagres den også i DB og sendes på e-post.`,
      });
    } catch (err) {
      toast({
        title: "Kunne ikke generere PDF",
        description: "Sjekk at @react-pdf/renderer er korrekt installert.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real version: POST to /api/invoices, then generate + email
    generateAndDownloadPDF();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ny faktura</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Kundenavn</label>
            <Input 
              value={form.customerName} 
              onChange={(e) => handleChange('customerName', e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">E-post</label>
              <Input 
                type="email" 
                value={form.customerEmail} 
                onChange={(e) => handleChange('customerEmail', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Org.nr (kunde)</label>
              <Input 
                value={form.customerOrgNr} 
                onChange={(e) => handleChange('customerOrgNr', e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Beskrivelse</label>
            <Input 
              value={form.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Beløp eks. MVA</label>
              <Input 
                type="number" 
                value={form.amountExVat} 
                onChange={(e) => handleChange('amountExVat', parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">MVA-sats</label>
              <Input 
                type="number" 
                value={form.vatRate} 
                onChange={(e) => handleChange('vatRate', parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Total (inkl. MVA)</label>
              <Input value={`${total.toLocaleString('nb-NO')} kr`} disabled />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Forfallsdato</label>
            <Input 
              type="date" 
              value={form.dueDate} 
              onChange={(e) => handleChange('dueDate', e.target.value)} 
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={generateAndDownloadPDF} className="flex-1">
              Last ned PDF (forhåndsvisning)
            </Button>
            <Button type="submit" className="flex-1">
              Opprett faktura &amp; last ned PDF
            </Button>
          </div>
        </form>
      </Card>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Demo: PDF genereres med @react-pdf/renderer. I full versjon: lagres i DB, EHF-XML, e-post via Resend, og oppfølging.
      </p>
    </div>
  );
}
