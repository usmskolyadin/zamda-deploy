'use client';

import { AuthProvider } from '@/src/features/context/auth-context';
import EditAd from './EditAd';

export default function EditAdPage() {
  return (
    <AuthProvider>
      <EditAd />
    </AuthProvider>
  );
}
