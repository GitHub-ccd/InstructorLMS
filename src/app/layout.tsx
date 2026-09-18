import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'InstructorLMS - Educator Control Panel',
  description: 'Zero-cost instructor-facing learning management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
