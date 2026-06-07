import './globals.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: 'GigShield — Income Protection for Gig Workers',
  description: 'AI-powered parametric income protection for gig delivery workers in India. Get covered against rain, heat, and air quality disruptions.',
  keywords: 'gig workers, income protection, insurance, delivery workers, India, parametric insurance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0B1F3A" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <TopNav />
        <main>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
