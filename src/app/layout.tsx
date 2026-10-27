import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OmniSim | What-If Business Scenario Simulator',
  description:
    'AI-powered scenario-analysis system for enterprise management to simulate the business consequences of strategic decisions against operational constraints.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full bg-slate-950">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
