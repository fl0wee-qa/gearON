import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteFooter } from "@/components/footer";
import { SiteHeader } from "@/components/header";
import { Providers } from "@/components/providers";
import { SITE_NAME } from "@/lib/constants";
import "@/lib/env";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | Gaming Store`,
  description:
    "gearON is a production-ready gaming accessories and PC components e-commerce app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${monoFont.variable} font-display antialiased`}
      >
        <Providers>
          <div className="bg-background text-foreground relative min-h-screen">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="bg-primary/15 absolute top-[-10%] left-[-20%] h-[35rem] w-[35rem] rounded-full blur-[120px]" />
              <div className="absolute right-[-15%] bottom-[-15%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[100px]" />
            </div>

            <SiteHeader />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
              {children}
            </main>
            <SiteFooter />
            <CartDrawer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
