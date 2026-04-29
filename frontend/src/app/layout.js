import './globals.css';

export const metadata = {
  title: 'VoteWise AI — Indian Election Assistant',
  description: 'An intelligent AI assistant that helps Indian citizens understand the election process, timelines, voter eligibility, and democratic rights interactively.',
  keywords: 'Indian elections, voter guide, election process, ECI, voting, democracy, AI assistant',
  authors: [{ name: 'VoteWise AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

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
      </body>
    </html>
  );
}

function Navigation() {
  const links = [
    { href: '/', label: 'Home', id: 'nav-home' },
    { href: '/timeline/', label: 'Timeline', id: 'nav-timeline' },
    { href: '/phase-map/', label: 'Phase Map', id: 'nav-map' },
    { href: '/assistant/', label: 'Assistant', id: 'nav-assistant' },
    { href: '/eligibility/', label: 'Eligibility', id: 'nav-eligibility' },
    { href: '/quiz/', label: 'Quiz', id: 'nav-quiz' },
    { href: '/glossary/', label: 'Glossary', id: 'nav-glossary' },
    { href: '/guide/', label: 'Guide', id: 'nav-guide' },
  ];

  return (
    <nav role="navigation" aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-40 glass-card border-0 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-display font-bold text-xl" aria-label="VoteWise AI Home">
          <span className="text-2xl" aria-hidden="true">🗳️</span>
          <span className="text-gradient">VoteWise AI</span>
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label={`Navigate to ${link.label}`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a
          href="/login/"
          id="nav-login"
          className="btn-primary text-sm !px-4 !py-2"
          aria-label="Sign in to your account"
        >
          Sign In
        </a>
      </div>
    </nav>
  );
}
