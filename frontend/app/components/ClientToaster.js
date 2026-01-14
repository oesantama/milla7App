'use client';

import { Toaster } from 'react-hot-toast';

export default function ClientToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '14px',
          maxWidth: '500px',
        },
        success: {
          duration: 3000,
          style: { background: '#10b981' },
        },
        error: {
          duration: 5000,
          style: { background: '#ef4444' },
        },
      }}
    />
  );
}
