import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'VoteWise AI — Indian Election Assistant',
  description: 'An intelligent AI assistant that helps Indian citizens understand the election process, timelines, voter eligibility, and democratic rights interactively.',
  keywords: 'Indian elections, voter guide, election process, ECI, voting, democracy, AI assistant',
  authors: [{ name: 'VoteWise AI Team' }],
};

import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';

export default function RootLayout({ children }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        {gaMeasurementId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaMeasurementId}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-[#0A0E1A] text-gray-100 font-sans antialiased">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only"
            aria-label="Skip to main content"
          >
            Skip to main content
          </a>
          <Navigation />
          <main id="main-content" role="main" className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

