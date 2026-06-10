import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Receipt, FileText, Settings, LogOut, Building2, User } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/route";
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
      {/* Premium glass header - copied & adapted from the beautiful skattpro-landing design */}
      <header className="glass-strong fixed top-0 left-0 w-full z-50 border-b" style={{borderColor: 'var(--border)'}}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">S</div>
              <span className="text-xl font-bold tracking-tight" style={{color: 'var(--text-primary)'}}>SkattPro</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-3 px-3 py-1.5 rounded-2xl glass text-sm font-medium" style={{color: 'var(--text-primary)'}}>
              <Building2 className="h-4 w-4 text-primary-500" />
              {companyName}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 font-semibold">{companyType}</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Link href="/dashboard" className="nav-link px-4 py-2 rounded-2xl hover:bg-white/50 transition-colors" style={{color: 'var(--text-secondary)'}}>Dashboard</Link>
            <Link href="/transactions" className="nav-link px-4 py-2 rounded-2xl hover:bg-white/50 transition-colors" style={{color: 'var(--text-secondary)'}}>Transaksjoner</Link>
            <Link href="/receipts" className="nav-link px-4 py-2 rounded-2xl hover:bg-white/50 transition-colors" style={{color: 'var(--text-secondary)'}}>Kvitteringer</Link>
            <Link href="/invoices" className="nav-link px-4 py-2 rounded-2xl hover:bg-white/50 transition-colors" style={{color: 'var(--text-secondary)'}}>Faktura</Link>
            <Link href="/reports" className="nav-link px-4 py-2 rounded-2xl hover:bg-white/50 transition-colors" style={{color: 'var(--text-secondary)'}}>Rapporter</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/settings" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass text-sm hover:bg-white/60 transition-colors" style={{color: 'var(--text-secondary)'}}>
              <Settings className="h-4 w-4" /> Innstillinger
            </Link>
            
            <div className="flex items-center gap-2 pl-3 border-l" style={{borderColor: 'var(--border)'}}>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>{session.user.name || 'Bruker'}</div>
                <div className="text-[10px]" style={{color: 'var(--text-muted)'}}>{session.user.email}</div>
              </div>
              <div className="w-9 h-9 rounded-2xl glass flex items-center justify-center">
                <User className="h-4 w-4" style={{color: 'var(--text-secondary)'}} />
              </div>
            </div>

            <form action="/api/auth/signout" method="POST">
              <Button variant="ghost" size="sm" className="gap-2 rounded-2xl glass hover:bg-red-500/10" type="submit">
                <LogOut className="h-4 w-4" /> Logg ut
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Subtle early-build note - glass style matching landing */}
      <div className="h-16" /> {/* Spacer for fixed header */}

      <div className="glass-strong border-b text-xs py-2 text-center" style={{background: 'rgba(251,191,36,0.06)', color: '#854d0e', borderColor: 'var(--border)'}}>
        Tidlig beta — bruk <strong>Seed demo til DB</strong> i Transaksjoner etter at du har satt DATABASE_URL og kjørt <code>prisma db push</code>. Design inspirert av vår landing.
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {children}
      </main>

      {/* Premium footer matching landing tone */}
      <footer className="border-t py-8 text-center text-xs" style={{borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-secondary)'}}>
        © 2026 SkattPro — Regnskap som holder deg i forkanten. GDPR-kompatibel • Data i EU
      </footer>
    </div>
  );
}
