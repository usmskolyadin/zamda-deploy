'use client';

import { AuthProvider } from '@/src/features/context/auth-context';
import Header from '@/src/widgets/header';
import BottomNav from '@/src/widgets/bottom-nav';
import Footer from '@/src/widgets/footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="lg:mt-32 mt-24">{children}</main>
      <BottomNav />
      <Footer />
    </AuthProvider>
  );
}
