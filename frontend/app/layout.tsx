import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getGlobalProfile } from "@/src/lib/api";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Suspense } from 'react';
import TelemetryHandler from './TelemetryHandler';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getGlobalProfile().catch(() => null);
  
  return {
    title: profile?.name ? `${profile.name} | Portafolio` : "Portafolio",
    description: profile?.headline || "System Architecture and Portfolio",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
        >
          {children}
          <Suspense fallback={null}>
            <TelemetryHandler />
          </Suspense>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string} />
        </ThemeProvider>
      </body>
    </html>
  );
}
