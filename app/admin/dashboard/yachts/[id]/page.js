'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import YachtForm from '../YachtForm';

// Dynamic route for editing yachts by ID
export default function EditYachtPage() {
  const router = useRouter();
  const params = useParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check authentication
    const loggedIn = typeof window !== 'undefined'
      ? localStorage.getItem('adminLoggedIn')
      : null;

    if (!loggedIn) {
      router.push('/admin');
      return;
    }

    // Get the ID from params
    const id = params?.id;
    
    if (!id) {
      console.error('No yacht ID found in URL');
      router.push('/admin/dashboard/yachts');
      return;
    }

    setIsReady(true);
  }, [router, params]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="h-10 w-10 border-4 border-gray-200 border-t-[#c8a75c] rounded-full animate-spin"
            aria-label="Loading spinner"
          />
          <p className="text-sm text-gray-500 tracking-wide">Loading yacht editor...</p>
        </div>
      </div>
    );
  }

  const yachtId = params?.id;
  
  if (!yachtId) {
    return null;
  }

  return <YachtForm yachtId={yachtId} />;
}

