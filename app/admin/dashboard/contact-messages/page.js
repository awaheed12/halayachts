"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const infoCardClasses =
  "flex items-center justify-between rounded-2xl border border-gray-100 bg-white/95 px-5 py-4 shadow-sm";

const actionButtonClasses =
  "inline-flex justify-center items-center px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1";

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [exportLoading, setExportLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewMessage, setViewMessage] = useState(null);

  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/contact");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch contact messages");
      }

      setMessages(data.data || []);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      const message = err.message || "Network error. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (!loggedIn) {
      router.push("/admin");
      return;
    }

    fetchMessages();
  }, [router, fetchMessages]);

  const stats = useMemo(() => {
    const unread = messages.filter((msg) => !msg.isRead).length;
    return {
      total: messages.length,
      unread,
      read: messages.length - unread,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let result = [...messages];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      result = result.filter((msg) => {
        const fullName = `${msg.firstName} ${msg.lastName}`.toLowerCase();
        return (
          fullName.includes(term) ||
          msg.email.toLowerCase().includes(term) ||
          msg.phone.toLowerCase().includes(term) ||
          msg.message.toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter !== "all") {
      const targetRead = statusFilter === "read";
      result = result.filter((msg) => Boolean(msg.isRead) === targetRead);
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name_asc":
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        case "name_desc":
          return `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`
          );
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [messages, searchTerm, statusFilter, sortOrder]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleExport = useCallback(() => {
    if (filteredMessages.length === 0) {
      toast.info("No messages to export");
      return;
    }

    try {
      setExportLoading(true);

      const rows = [
        [
          "First Name",
          "Last Name",
          "Email",
          "Phone",
          "Message",
          "Status",
          "Created At",
        ],
        ...filteredMessages.map((msg) => [
          msg.firstName,
          msg.lastName,
          msg.email,
          `${msg.countryCode} ${msg.phone}`,
          msg.message.replace(/\n/g, " "),
          msg.isRead ? "Read" : "Unread",
          formatDate(msg.createdAt),
        ]),
      ];

      const csvContent = rows
        .map((row) =>
          row
            .map((value) => {
              if (value === undefined || value === null) return "";
              const stringValue = value.toString();
              if (stringValue.includes(",") || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `contact-messages-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Messages exported successfully");
    } catch (err) {
      console.error("Export CSV error:", err);
      toast.error("Failed to export messages");
    } finally {
      setExportLoading(false);
    }
  }, [filteredMessages, formatDate]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      setActionLoadingId(id);
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete message");
      }

      toast.success("Message deleted successfully");
      fetchMessages();
    } catch (err) {
      console.error("Delete message error:", err);
      toast.error(err.message || "Failed to delete message");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRead = async (msg) => {
    try {
      setActionLoadingId(msg.id);
      const response = await fetch(`/api/contact/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !msg.isRead }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update message");
      }

      toast.success(`Message marked as ${msg.isRead ? "unread" : "read"}`);
      fetchMessages();
    } catch (err) {
      console.error("Toggle read error:", err);
      toast.error(err.message || "Failed to update message");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEditModal = (msg) => {
    setEditData({
      id: msg.id,
      firstName: msg.firstName,
      lastName: msg.lastName,
      email: msg.email,
      phone: msg.phone,
      countryCode: msg.countryCode,
      message: msg.message,
      isRead: msg.isRead,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData?.id) return;

    try {
      setEditLoading(true);
      const response = await fetch(`/api/contact/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update message");
      }

      toast.success("Message updated successfully");
      setEditModalOpen(false);
      setEditData(null);
      fetchMessages();
    } catch (err) {
      console.error("Edit message error:", err);
      toast.error(err.message || "Failed to update message");
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8a75c] mb-4"></div>
          <p className="text-gray-600">Loading contact messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f2f2] via-[#f2f2f2] to-[#f2f2f2]">
      <header className="border-b border-[#f2f2f2] bg-[#f2f2f2] backdrop-blur mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center text-base md:text-lg lg:text-xl tracking-wider font-light cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to dashboard
            </button>
            {/* <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Contact Centre</p> */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={infoCardClasses}>
              <div>
                <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                  Total
                </p>
                <p className="text-2xl font-semibold tracking-wider">
                  {stats.total}
                </p>
              </div>
              <div className="text-blue-500">
                <svg
                  className="w-9 h-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className={infoCardClasses}>
              <div>
                <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                  Unread
                </p>
                <p className="text-2xl font-semibold tracking-wider">
                  {stats.unread}
                </p>
              </div>
              <div className="text-amber-500">
                <svg
                  className="w-9 h-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M9.75 17L9 14H3l6.105-8.828a4 4 0 013.182-1.672h.043a4 4 0 013.183 1.718L21 14h-6l-.75 3h-4.5z"
                  />
                </svg>
              </div>
            </div>
            <div className={infoCardClasses}>
              <div>
                <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                  Read
                </p>
                <p className="text-2xl font-semibold tracking-wider">
                  {stats.read}
                </p>
              </div>
              <div className="text-green-500">
                <svg
                  className="w-9 h-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M9 12l2 2 4-4M7 7l5-4 5 4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M21 10a11.05 11.05 0 01-.697 3.837A11 11 0 1112 1"
                  />
                </svg>
              </div>
            </div>
            <div className={infoCardClasses}>
              <div>
                <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                  Filtered
                </p>
                <p className="text-2xl font-semibold tracking-wider">
                  {filteredMessages.length}
                </p>
              </div>
              <div className="text-purple-500">
                <svg
                  className="w-9 h-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-8 8v6l-4-2v-4L3 6V4z"
                  />
                </svg>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-light tracking-wider">
                    Contact Messages
                  </h3>
                  <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
                    {filteredMessages.length} of {messages.length} message(s)
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                  {error && (
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExport}
                    disabled={exportLoading || filteredMessages.length === 0}
                    className={`${actionButtonClasses} bg-text-primary text-white text-sm md:text-base tracking-wider font-light disabled:opacity-60`}
                  >
                    {exportLoading ? "Exporting..." : "Export CSV"}
                  </button>
                  <button
                    onClick={fetchMessages}
                    className={`${actionButtonClasses} text-sm md:text-base tracking-wider font-light border border-gray-300 text-gray-700 hover:bg-gray-50`}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:none focus:none text-base tracking-wider font-light"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:none focus:none text-base tracking-wider font-light"
                >
                  <option
                    className="text-base tracking-wider font-light"
                    value="all"
                  >
                    All Statuses
                  </option>
                  <option
                    className="text-base tracking-wider font-light"
                    value="read"
                  >
                    Read
                  </option>
                  <option
                    className="text-base tracking-wider font-light"
                    value="unread"
                  >
                    Unread
                  </option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:none focus:none text-base tracking-wider font-light"
                >
                  <option
                    className="text-base tracking-wider font-light"
                    value="newest"
                  >
                    Newest First
                  </option>
                  <option
                    className="text-base tracking-wider font-light"
                    value="oldest"
                  >
                    Oldest First
                  </option>
                  <option
                    className="text-base tracking-wider font-light"
                    value="name_asc"
                  >
                    Name A-Z
                  </option>
                  <option
                    className="text-base tracking-wider font-light"
                    value="name_desc"
                  >
                    Name Z-A
                  </option>
                </select>
                <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-base tracking-wider font-light text-gray-600">
                  <span className="text-base tracking-wider font-light">
                    Showing
                  </span>
                  <strong className="text-black text-base tracking-wider font-light">
                    {filteredMessages.length}
                  </strong>
                </div>
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <h3 className="text-2xl tracking-wider font-light">
                  No contact messages found
                </h3>
                <p className="text-base tracking-wider font-light">
                  {searchTerm
                    ? "Try adjusting your search term."
                    : "Messages will appear here once submitted."}
                </p>
                {error && (
                  <button
                    onClick={fetchMessages}
                    className="bg-text-primary text-white text-sm md:text-base tracking-wider font-light disabled:opacity-60 transition"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-semibold capitalize tracking-wider">
                        Name & Date
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-semibold capitalize tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-semibold capitalize tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-semibold capitalize tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-semibold capitalize tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-base tracking-wider font-light">
                              {msg.firstName} {msg.lastName}
                            </p>
                            <p className="text-base tracking-wider font-light text-gray-500">
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-base tracking-wider font-light text-gray-900">
                            {msg.email}
                          </p>
                          <p className="text-base tracking-wider font-light text-gray-500">
                            {msg.countryCode} {msg.phone}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-base tracking-wider font-light text-gray-700 max-w-xs line-clamp-3">
                            {msg.message}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-base tracking-wider  font-medium border ${
                              msg.isRead
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full mr-2"
                              style={{
                                backgroundColor: msg.isRead
                                  ? "#15803d"
                                  : "#b45309",
                              }}
                            />
                            {msg.isRead ? "Read" : "Unread"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base tracking-wider cursor-pointer">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setViewMessage(msg)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleToggleRead(msg)}
                              disabled={actionLoadingId === msg.id}
                              className="text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-60"
                            >
                              {msg.isRead ? "Mark Unread" : "Mark Read"}
                            </button>
                            <button
                              onClick={() => openEditModal(msg)}
                              className="text-amber-600 hover:text-amber-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              disabled={actionLoadingId === msg.id}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {editModalOpen && editData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl tracking-wider font-semibold text-gray-900">
                  Edit Message
                </h3>
                <button
                  className="p-2 text-gray-500 tracking-wider hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditData(null);
                  }}
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
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block tracking-wider text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-text-primary/50 focus:border-text-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm tracking-wider font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border tracking-wider border-gray-300 rounded-lg focus:ring-2 focus:ring-text-primary/50 focus:border-text-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm tracking-wider font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border tracking-wider border-gray-300 rounded-lg focus:ring-2 focus:ring-text-primary/50 focus:border-text-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium tracking-wider text-gray-700">
                    Country Code
                  </label>
                  <input
                    type="text"
                    name="countryCode"
                    value={editData.countryCode}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 border tracking-wider border-gray-300 rounded-lg focus:ring-2 focus:ring-text-primary/50 focus:border-text-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium tracking-wider text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-3 border tracking-wider border-gray-300 rounded-lg focus:ring-2 focus:ring-text-primary/50 focus:border-text-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium tracking-wider text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={editData.message}
                  onChange={handleEditChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border tracking-wider border-gray-300 rounded-lg focus:ring-2 focus:ring-text-primary/50 focus:border-text-primary transition-colors resize-vertical"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  id="isRead"
                  type="checkbox"
                  name="isRead"
                  checked={!!editData.isRead}
                  onChange={handleEditChange}
                  className="w-4 h-4 text-text-primary tracking-wider  border-gray-300 rounded focus:ring-text-primary/50"
                />
                <label
                  htmlFor="isRead"
                  className="text-sm font-medium tracking-wider text-gray-700"
                >
                  Mark as read
                </label>
              </div>

              <div className="flex flex-col sm:flex-row tracking-wider justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditData(null);
                  }}
                  className="px-6 py-3 border border-gray-300 tracking-wider text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-3 bg-text-primary text-white tracking-wider rounded-lg hover:bg-text-primary/90 font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {editLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75 tracking-wider"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMessage && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center px-4 py-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl tracking-wider font-semibold text-gray-900">
                  Message Details
                </h3>
                <button
                  className="p-2 text-gray-500 tracking-wider hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setViewMessage(null)}
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
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs  font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="text-base tracking-wider text-gray-900 font-medium">
                    {viewMessage.firstName} {viewMessage.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-base text-gray-900 font-medium">
                    {viewMessage.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-base text-gray-900 font-medium">
                    {viewMessage.countryCode} {viewMessage.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      viewMessage.isRead
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full mr-2"
                      style={{
                        backgroundColor: viewMessage.isRead
                          ? "#15803d"
                          : "#b45309",
                      }}
                    />
                    {viewMessage.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Submitted At
                </p>
                <p className="text-base text-gray-900 font-medium">
                  {formatDate(viewMessage.createdAt)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Message
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-base tracking-wider text-gray-900 whitespace-pre-line leading-relaxed">
                    {viewMessage.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setViewMessage(null)}
                  className="px-6 py-3 bg-text-primary text-white rounded-lg hover:bg-text-primary/90 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}
