import './globals.css';
import { ClientProviders } from '@/components/ui/ClientProviders';
import { Footer } from '@/components/ui/Footer';
import { Navbar } from '@/components/ui/Navbar';

export const metadata = {
  title: 'MEDINEXA AI | Connected Spatial Care',
  description: 'Safety-first injury guidance and connected healthcare discovery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="medinexa">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>
          <Navbar />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
