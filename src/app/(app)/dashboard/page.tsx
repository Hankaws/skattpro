import { getServerSession } from "next-auth";
import { auth } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold">S</div>
            <span className="font-bold text-lg">SkattPro</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
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

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Velkommen tilbake</h1>
          <p className="text-slate-600 text-sm mt-1">Dette er ditt nye regnskap.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Omsetning" value="1 245 000 kr" trend="+8.2%" />
          <StatCard title="Utgifter" value="432 000 kr" trend="-1.4%" />
          <StatCard title="Resultat" value="813 000 kr" trend="+14.1%" />
          <StatCard title="Ubetalte fakturaer" value="12" trend="8 dager forfall" />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{trend}</div>
    </div>
  );
}
