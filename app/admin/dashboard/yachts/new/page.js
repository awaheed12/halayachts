'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import YachtForm from '../YachtForm';

export default function NewYachtPage() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const loggedIn = typeof window !== 'undefined'
        ? localStorage.getItem('adminLoggedIn')
        : null;

      if (!loggedIn) {
        router.push('/admin');
        return;
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      router.push('/admin');
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="h-10 w-10 border-4 border-gray-200 border-t-[#c8a75c] rounded-full animate-spin"
            aria-label="Loading spinner"
          />
          <p className="text-sm text-gray-500 tracking-wide">Preparing admin dashboard...</p>
        </div>
      </div>
    );
  }

  return <YachtForm yachtId="new" />;
}

