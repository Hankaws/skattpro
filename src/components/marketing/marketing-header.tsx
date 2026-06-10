"use client";

import { useState } from "react";
import Link from "next/link";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 w-full z-40 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-500 text-white grid place-items-center font-bold shadow-sm">S</div>
            <span className="text-xl font-bold tracking-tight">SkattPro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#home" className="hover:text-slate-900">Hjem</Link>
            <Link href="#features" className="hover:text-slate-900">Funksjoner</Link>
            <Link href="#pricing" className="hover:text-slate-900">Priser</Link>
            <Link href="#faq" className="hover:text-slate-900">FAQ</Link>
            <Link href="#contact" className="hover:text-slate-900">Kontakt</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm font-medium text-slate-600 hover:text-slate-900">Logg inn</Link>
            <Link href="/auth/signup" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Kom i gang</Link>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg border"
            aria-label="Meny"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            <MobileLink href="#home" onPress={() => setOpen(false)}>Hjem</MobileLink>
            <MobileLink href="#features" onPress={() => setOpen(false)}>Funksjoner</MobileLink>
            <MobileLink href="#pricing" onPress={() => setOpen(false)}>Priser</MobileLink>
            <MobileLink href="#faq" onPress={() => setOpen(false)}>FAQ</MobileLink>
            <MobileLink href="#contact" onPress={() => setOpen(false)}>Kontakt</MobileLink>
            <div className="pt-2">
              <Link href="/auth/signin" className="block text-center w-full rounded-lg border py-2 text-sm font-medium">Logg inn</Link>
              <Link href="/auth/signup" className="mt-2 block text-center w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white">Kom i gang</Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MobileLink({ href, onPress, children }: { href: string; onPress?: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onPress} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}
