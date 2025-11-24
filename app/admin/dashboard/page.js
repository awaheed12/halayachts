"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Guard admin routes on the client
  useEffect(() => {
    try {
      const loggedIn =
        typeof window !== "undefined"
          ? localStorage.getItem("adminLoggedIn")
          : null;

      if (!loggedIn) {
        router.push("/admin");
        return;
      }

      setIsReady(true);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      router.push("/admin");
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("adminLoggedIn");
      router.push("/admin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
            aria-label="Loading spinner"
          />
          <p className="text-sm text-gray-500 tracking-wide">
            Preparing admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  const Card = ({ href, bgColor, icon, title, description, footer }) => (
    <Link
      href={href}
      className={`group bg-white border border-gray-100 rounded-2xl shadow-xl hover:shadow-md hover:border-${bgColor}-100 transition-all cursor-pointer flex flex-col justify-between`}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 bg-${bgColor}-50 rounded-full flex items-center justify-center group-hover:bg-${bgColor}-100 transition`}
            >
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-2xl md:text-3xl font-light tracking-wide text-[#03066B]">
              {title}
            </p>
            <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <span className="text-sm md:text-base lg:text-lg font-light text-secondary group-hover:text-secondary-700 tracking-wide inline-flex items-center">
          {footer}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f2f2] via-[#f2f2f2] to-[#f2f2f2]">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-light tracking-wide">
                  HalaYachts Admin
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-lg text-base font-light bg-text-primary text-white shadow-sm hover:bg-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-text-primary tracking-wide transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-3xl lg:text-6xl tracking-wider">
              Dashboard Overview
            </h2>
            <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
              Quick access to key management sections of your website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card
              href="/admin/dashboard/subscribers"
              bgColor="blue"
              icon={
                <svg
                  className="w-8 h-8 text-blue-600"
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
              }
              title="Newsletter"
              description="Manage Subscribers"
              footer="View all subscribers →"
            />
            <Card
              href="/admin/dashboard/contact-messages"
              bgColor="purple"
              icon={
                <svg
                  className="w-8 h-8 text-purple-600"
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
              }
              title="Contact Messages"
              description="View All Messages"
              footer="View all messages →"
            />
            {/* NEW: Locations Management Card */}
            <Card
              href="/admin/dashboard/locations"
              bgColor="green"
              icon={
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              title="Locations"
              description="Manage All Locations"
              footer="Manage locations →"
            />
            <Card
              href="/admin/dashboard/bookings"
              bgColor="orange"
              icon={
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="Bookings"
              description="Manage All Bookings"
              footer="View all bookings →"
            />
            <Card
              href="/admin/dashboard/yachts"
              bgColor="indigo"
              icon={
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
              title="Yachts"
              description="Manage All Yachts"
              footer="Manage yachts →"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
