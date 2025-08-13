import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KP5 Academy - Elite Sports Management Platform',
  description: 'Professional sports management platform for elite clubs, teams, and athletes. Real-time match tracking, tournament management, and comprehensive player development.',
  keywords: 'sports academy, elite sports, club management, tournament management, player development, match tracking, sports analytics',
  authors: [{ name: 'KP5 Academy' }],
  creator: 'KP5 Academy',
  publisher: 'KP5 Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'),
  openGraph: {
    title: 'KP5 Academy - Elite Sports Management Platform',
    description: 'Professional sports management platform for elite clubs, teams, and athletes.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003',
    siteName: 'KP5 Academy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'KP5 Academy - Elite Sports Management Platform',
    description: 'Professional sports management platform for elite clubs, teams, and athletes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#00529F" />
        
        {/* Favicon and PWA assets - only include if files exist */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Bootstrap Icons */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      </head>
      <body className={`${inter.className} bg-white`}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </Providers>
        
        {/* Bootstrap JavaScript */}
        <script 
          src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        />
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.min.js"
        />
      </body>
    </html>
  );
} 