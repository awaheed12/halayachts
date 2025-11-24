"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookingsPage() {
  const [isReady, setIsReady] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [charterTypeFilter, setCharterTypeFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const loggedIn =
      typeof window !== "undefined"
        ? localStorage.getItem("adminLoggedIn")
        : null;

    if (!loggedIn) {
      router.push("/admin");
      return;
    }

    setIsReady(true);
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const result = await response.json();

      if (result.success) {
        setBookings(result.data || []);
      } else {
        console.error("Failed to fetch bookings:", result.error);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("adminLoggedIn");
      router.push("/admin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [router]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
        console.log("Booking status updated successfully");
      } else {
        console.error("Failed to update booking:", result.error);
        alert(`Failed to update booking status: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Error updating booking status. Please try again.");
    }
  };

  const exportToCSV = () => {
    const filtered = getFilteredBookings();

    const headers = [
      "Booking Reference",
      "Customer Name",
      "Email",
      "Phone",
      "Yacht",
      "Charter Type",
      "Location",
      "Date",
      "Time",
      "Passengers",
      "Status",
      "Created At",
    ];

    const csvData = filtered.map((booking) => [
      booking.bookingReference,
      `${booking.firstName} ${booking.lastName}`,
      booking.email,
      booking.phone,
      booking.yachtTitle,
      booking.charterType,
      booking.location,
      booking.charterType === "day"
        ? new Date(booking.date).toLocaleDateString()
        : `${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(booking.checkOutDate).toLocaleDateString()}`,
      booking.time || "N/A",
      booking.passengers,
      booking.status,
      new Date(booking.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFilteredBookings = () => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingReference
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.yachtTitle?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      const matchesCharterType =
        charterTypeFilter === "all" ||
        booking.charterType === charterTypeFilter;

      return matchesSearch && matchesStatus && matchesCharterType;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border border-green-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
      completed: "bg-blue-100 text-blue-800 border border-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="h-10 w-10 border-4 border-gray-200 border-t-[#c8a75c] rounded-full animate-spin"
            aria-label="Loading spinner"
          />
          <p className="text-base text-black tracking-wider">
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-lg mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-black hover:text-[#c8a75c] transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900 tracking-wide">
                  Bookings Management
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-3 rounded-lg text-base font-medium bg-[#c8a75c] text-white shadow-sm hover:bg-[#b8974c] focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:ring-offset-2 tracking-wide transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 tracking-wide mb-3">
            All Bookings
          </h2>
          <p className="text-base md:text-lg text-black tracking-wide font-light">
            Manage and monitor all yacht charter bookings in one place
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            {/* Search */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 tracking-wide">
                Search Bookings
              </label>
              <input
                type="text"
                placeholder="Search by reference, name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition-all duration-200 tracking-wide"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 tracking-wide">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition-all duration-200 tracking-wide bg-white"
              >
                <option value="all" className="text-base">
                  All Status
                </option>
                <option value="pending" className="text-base">
                  Pending
                </option>
                <option value="confirmed" className="text-base">
                  Confirmed
                </option>
                <option value="cancelled" className="text-base">
                  Cancelled
                </option>
                <option value="completed" className="text-base">
                  Completed
                </option>
              </select>
            </div>

            {/* Charter Type Filter */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 tracking-wide">
                Charter Type
              </label>
              <select
                value={charterTypeFilter}
                onChange={(e) => setCharterTypeFilter(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition-all duration-200 tracking-wide bg-white"
              >
                <option value="all" className="text-base">
                  All Types
                </option>
                <option value="day" className="text-base">
                  Day Charter
                </option>
                <option value="multiday" className="text-base">
                  Multiday Charter
                </option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={filteredBookings.length === 0}
                className="w-full px-4 py-3 bg-[#c8a75c] text-white rounded-xl hover:bg-[#b8974c] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 tracking-wide font-semibold text-base transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                Export CSV ({filteredBookings.length})
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 tracking-wide">
                {bookings.length}
              </div>
              <div className="text-base font-medium text-blue-600 tracking-wide mt-1">
                Total Bookings
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700 tracking-wide">
                {bookings.filter((b) => b.status === "pending").length}
              </div>
              <div className="text-base font-medium text-yellow-600 tracking-wide mt-1">
                Pending
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700 tracking-wide">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
              <div className="text-base font-medium text-green-600 tracking-wide mt-1">
                Confirmed
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="text-2xl font-bold text-red-700 tracking-wide">
                {bookings.filter((b) => b.status === "cancelled").length}
              </div>
              <div className="text-base font-medium text-red-600 tracking-wide mt-1">
                Cancelled
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-16">
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="h-12 w-12 border-4 border-gray-200 border-t-[#c8a75c] rounded-full animate-spin"
                  aria-label="Loading spinner"
                />
                <p className="text-base text-black tracking-wide font-medium">
                  Loading bookings...
                </p>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center p-16">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-xl text-gray-500 tracking-wide font-medium mb-2">
                No bookings found
              </p>
              <p className="text-base text-gray-400 tracking-wide">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wide">
                      Booking Details
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wide">
                      Charter Information
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wide">
                      Passengers
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wide">
                      Update Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="text-base font-semibold text-gray-900 tracking-wide">
                            {booking.bookingReference}
                          </div>
                          <div className="text-base text-gray-700 tracking-wide">
                            <span className="font-medium">
                              {booking.firstName} {booking.lastName}
                            </span>
                          </div>
                          <div className="text-base text-black tracking-wide">
                            {booking.email}
                          </div>
                          <div className="text-base text-black tracking-wide">
                            {booking.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="text-base font-semibold text-gray-900 tracking-wide">
                            {booking.yachtTitle}
                          </div>
                          <div className="text-base text-gray-700 tracking-wide">
                            {booking.charterType === "day" ? (
                              <>
                                <span className="font-medium">
                                  {formatDate(booking.date)}
                                </span>{" "}
                                at {booking.time}
                              </>
                            ) : (
                              <>
                                <span className="font-medium">
                                  {formatDate(booking.checkInDate)}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                  {formatDate(booking.checkOutDate)}
                                </span>
                                <br />
                                <span className="text-base text-gray-500 tracking-wide bg-gray-100 px-2 py-1 rounded-full">
                                  {booking.numberOfNights} nights
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-base text-black tracking-wide">
                            {booking.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-semibold text-gray-900 tracking-wide">
                          {booking.passengers}{" "}
                          {booking.passengers === 1 ? "person" : "people"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-base font-semibold rounded-full ${getStatusColor(booking.status)} tracking-wide`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            updateBookingStatus(booking._id, e.target.value)
                          }
                          className="text-base border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition-all duration-200 tracking-wide bg-white min-w-[140px]"
                        >
                          <option value="pending" className="text-base">
                            Pending
                          </option>
                          <option value="confirmed" className="text-base">
                            Confirmed
                          </option>
                          <option value="cancelled" className="text-base">
                            Cancelled
                          </option>
                          <option value="completed" className="text-base">
                            Completed
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
