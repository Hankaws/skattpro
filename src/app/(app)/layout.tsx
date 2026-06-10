import { redirect } from "next/navigation";
import { auth } from "../../api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="h-9 w-9 rounded-lg bg-primary-500 text-white grid place-items-center font-bold shadow-sm">S</Link>
            <span className="font-bold text-lg tracking-tight">SkattPro</span>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
            <Link href="/invoices" className="text-slate-600 hover:text-slate-900">Faktura</Link>
            <Link href="/transactions" className="text-slate-600 hover:text-slate-900">Transaksjoner</Link>
            <Link href="/receipts" className="text-slate-600 hover:text-slate-900">Kvitteringer</Link>
            <Link href="/settings" className="text-slate-600 hover:text-slate-900">Innstillinger</Link>
            <form action="/api/auth/signout" method="POST">
              <Button variant="secondary" size="sm" type="submit">Logg ut</Button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
