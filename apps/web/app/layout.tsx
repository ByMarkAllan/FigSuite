import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FigSuite — The forecasting terminal',
  description: 'Analyze scenarios, express calibrated forecasts and build a verified analytical track record. Simulation only. No real-money trading.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
