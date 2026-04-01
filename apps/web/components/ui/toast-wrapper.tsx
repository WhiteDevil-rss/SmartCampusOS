'use client';

import React, { ReactNode } from 'react';
import { useToast, Toast } from './toast-alert';

export default function ToastWrapper({ children }: { children: ReactNode }) {
  const { toast, hideToast } = useToast();
  return (
    <>
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </>
  );
}
