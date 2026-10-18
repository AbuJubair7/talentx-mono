import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'TalentX — AI Job Marketplace',
  description: 'Connect with top AI and tech talent on TalentX',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log("RootLayout render check");
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, geistMono.variable)}>
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  )
}