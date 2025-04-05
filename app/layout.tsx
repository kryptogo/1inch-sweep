import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
// import { Providers } from "./providers";
import { Web3Provider } from './web3-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoSweep - Discover & Convert Idle Crypto Assets',
  description:
    'Find and convert your forgotten crypto assets across multiple blockchains into stable coins',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Web3Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <SonnerToaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
