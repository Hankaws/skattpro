import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Receipt, FileText, Settings, LogOut, Building2 } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch user's primary company for header (MVP: first one)
  let companyName = "Min bedrift";
  let companyType = "ENK";
  try {
    const company = await prisma.company.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { name: true, type: true },
    });
    if (company) {
      companyName = company.name;
      companyType = company.type || "ENK";
    }
  } catch (e) {
    // DB not ready or no company yet — fallback to defaults
  }

  return (
    <div className="min-h-screen bg-slate-50 app-shell">
      {/* Top bar */}
      <header className="glass-strong border-b sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">S</div>
              <span className="font-bold text-xl tracking-tight">SkattPro</span>
            </Link>

            <div className="ml-4 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-medium">
              <Building2 className="h-4 w-4 text-slate-500" />
              {companyName}
              <span className="text-[10px] px-1.5 py-px rounded bg-white text-slate-500">{companyType}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 hidden sm:inline">Hei, {session.user.name?.split(" ")[0] || "bruker"}</span>
            <Link href="/auth/signout">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" /> Logg ut
              </Button>
            </Link>
          </div>
        </div>

        {/* App navigation */}
        <div className="border-t glass" style={{background: 'var(--bg-glass)'}}>
          <div className="mx-auto max-w-7xl px-6 flex items-center gap-1 text-sm h-12">
            <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
            <NavLink href="/transactions" icon={<Receipt className="h-4 w-4" />}>Transaksjoner</NavLink>
            <NavLink href="/receipts" icon={<FileText className="h-4 w-4" />}>Kvitteringer</NavLink>
            <NavLink href="/invoices" icon={<FileText className="h-4 w-4" />}>Faktura</NavLink>
            <NavLink href="/reports" icon={<FileText className="h-4 w-4" />}>Rapporter</NavLink>
            <div className="flex-1" />
            <Link href="/settings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 text-sm">
              <Settings className="h-4 w-4" /> Innstillinger
            </Link>
          </div>
        </div>
      </header>

      {/* Helpful banner while DB is being set up - glass style */}
      <div className="glass-strong border-b text-xs py-1.5 text-center text-amber-700" style={{background: 'rgba(251, 191, 36, 0.08)'}}>
        Early build — use <strong>Seed demo til DB</strong> on the Transactions page after adding DATABASE_URL + running <code>prisma db push</code>.
      </div>

      <main>{children}</main>
    </div>
  );
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
    >
      {icon} {children}
    </Link>
  );
}
