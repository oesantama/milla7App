'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading on path change
    setLoading(true);
    setProgress(30);

    const timer = setTimeout(() => {
      setProgress(70);
    }, 200);

    const finishTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }, 500); // Simulate network delay or wait for React commit

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${progress}%`,
      height: '3px',
      background: '#2196f3',
      zIndex: 99999,
      transition: 'width 0.2s ease-out'
    }} />
  );
}
