import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { getActiveInstructor } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'InstructorLMS - Educator Control Panel',
  description: 'Zero-cost instructor-facing learning management system',
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentInstructor = await getActiveInstructor();

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <Sidebar currentInstructor={currentInstructor} />
        <main className="flex-1 pt-20 md:pt-8 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
