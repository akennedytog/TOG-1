import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { QueryProvider } from './query-provider';
import { SharedHeader } from '@/components/SharedHeader';
import { PageTransition } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BabyNest - Your Financial Guide to Parenthood',
  description: 'Navigate insurance, 529 plans, taxes, and legal tasks for your new baby. AI-powered guidance for new parents.',
  keywords: ['baby', 'financial planning', 'new parents', 'insurance', '529 plan', 'tax benefits'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <SharedHeader />
          <PageTransition>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </PageTransition>
          <Analytics />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}