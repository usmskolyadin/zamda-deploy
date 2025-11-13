'use client';

import { AuthProvider } from '@/src/features/context/auth-context';
import NewAd from './NewAd';

export default function NewAdPage() {
  return (
    <AuthProvider>
      <NewAd />
    </AuthProvider>
  );
}
