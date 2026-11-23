import type { Metadata } from 'next';
import './globals.css';
import { PictureProvider } from '../utils/pictureContext';

export const metadata: Metadata = {
  title: 'SpectraGL - 10,000-Point WebGL Scatter Plot',
  description:
    'High-performance interactive 10,000-point WebGL scatter plot using D3.js and GPU rendering for IFS image pointillism and data visualization.',
  openGraph: {
    title: 'SpectraGL - 10,000-Point WebGL Scatter Plot',
    description:
      'High-performance interactive 10,000-point WebGL scatter plot using D3.js and GPU rendering for IFS image pointillism and data visualization.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
