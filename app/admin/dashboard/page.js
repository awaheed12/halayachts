'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Guard admin routes on the client
  useEffect(() => {
    const loggedIn = typeof window !== 'undefined'
      ? localStorage.getItem('adminLoggedIn')
      : null;

    if (!loggedIn) {
      router.push('/admin');
      return;
    }

    setIsReady(true);
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin');
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 tracking-wide">Preparing admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-light tracking-wide">
                  Hala Yachts Admin
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-lg text-base font-light bg-text-primary text-white shadow-sm hover:bg-text-primary  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-text-primary tracking-wide transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-3xl lg:text-4xl tracking-wider">
              Dashboard Overview
            </h2>
            <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
              Quick access to key management sections of your website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subscribers Card */}
            <Link
              href="/admin/dashboard/subscribers"
              className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl md:text-3xl font-light tracking-wide text-[#03066B] ">
                      Newsletter
                    </p>
                    <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                      Manage Subscribers
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                <span className="text-sm md:text-base lg:text-lg  font-light text-secondary group-hover:text-secondary-700 tracking-wide inline-flex items-center">
                  View all subscribers →
                </span>
              </div>
            </Link>

            {/* Contact Messages Card */}
            <Link
              href="/admin/dashboard/contact-messages"
              className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-100 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="ttext-2xl md:text-3xl font-light tracking-wide text-[#03066B] ">
                      Contact Messages
                    </p>
                    <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                      View All Messages
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
              <span className="text-sm md:text-base lg:text-lg  font-light text-secondary group-hover:text-secondary-700 tracking-wide inline-flex items-center">
                  View all messages →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}