'use client';
import { Toast, useToast } from '@/components/ui/toast-alert';
import type { ReactNode } from 'react';

export default function ToastContainer({ children }: { children: ReactNode }) {
  const { toast, hideToast } = useToast();
  return (
    <>
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </>
  );
};
