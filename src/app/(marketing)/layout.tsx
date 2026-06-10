import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SkattPro | Regnskap som holder deg i forkanten",
  description: "Alt du trenger for å drive bedrift — faktura, regnskap, skattemelding, lønn og bankavstemming — i ett enkelt, moderne system for norske bedrifter. 14 dagers gratis prøveperiode.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-body min-h-screen" style={{ 
      '--bg-primary': '#ffffff', 
      '--text-primary': '#0f172a',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    } as React.CSSProperties}>
      {/* The landing page is self-contained with its own header/footer.
          This layout just provides the root HTML shell + metadata. 
          We force marketing-body here to isolate from shadcn/next-themes overrides. */}
      {children}
    </div>
  );
}
