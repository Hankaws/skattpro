import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-black/5 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary-500 text-white grid place-items-center font-bold shadow-sm">S</div>
            <span className="font-bold text-lg">SkattPro</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">Alt du trenger for å drive bedrift. Regnskap som holder deg i forkanten.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Produkt</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="#features" className="hover:text-primary-600">Funksjoner</Link></li>
            <li><Link href="#pricing" className="hover:text-primary-600">Priser</Link></li>
            <li><Link href="#faq" className="hover:text-primary-600">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Selskap</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="#contact" className="hover:text-primary-600">Kontakt</Link></li>
            <li><Link href="#" className="hover:text-primary-600">Personvern</Link></li>
            <li><Link href="#" className="hover:text-primary-600">Vilkår</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Kontakt</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>post@skattpro.no</li>
            <li>Oslo, Norge</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2026 SkattPro. Alle rettigheter reservert.</p>
          <p className="text-xs text-slate-500">Betalt SSL · GDPR-kompatibel</p>
        </div>
      </div>
    </footer>
  );
}
