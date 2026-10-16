'use client';

import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export default function GlobalToaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={3000}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-pretendard), sans-serif',
          zIndex: 99999,
        },
      }}
    />
  );
}
