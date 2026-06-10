import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SkattPro | Regnskap som holder deg i forkanten",
  description: "Alt du trenger for å drive bedrift. Regnskap, faktura, skattemelding, lønn og bank — i ett moderne system for norske bedrifter.",
  keywords: ["regnskap", "faktura", "skattemelding", "bedriftsregnskap", "enk", "norge"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
