import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSessionUser } from '@/app/actions/auth';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header initialUser={user} />
      <main className="grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
