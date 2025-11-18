'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const infoCardClasses =
  'flex items-center justify-between rounded-2xl border border-gray-100 bg-white/95 px-5 py-4 shadow-sm';

const actionButtonClasses =
  'inline-flex justify-center items-center px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
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

      const response = await fetch('/api/contact');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch contact messages');
      }

      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      const message = err.message || 'Network error. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/admin');
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

    if (statusFilter !== 'all') {
      const targetRead = statusFilter === 'read';
      result = result.filter((msg) => Boolean(msg.isRead) === targetRead);
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name_asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name_desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [messages, searchTerm, statusFilter, sortOrder]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleExport = useCallback(() => {
    if (filteredMessages.length === 0) {
      toast.info('No messages to export');
      return;
    }

    try {
      setExportLoading(true);

      const rows = [
        ['First Name', 'Last Name', 'Email', 'Phone', 'Message', 'Status', 'Created At'],
        ...filteredMessages.map((msg) => [
          msg.firstName,
          msg.lastName,
          msg.email,
          `${msg.countryCode} ${msg.phone}`,
          msg.message.replace(/\n/g, ' '),
          msg.isRead ? 'Read' : 'Unread',
          formatDate(msg.createdAt),
        ]),
      ];

      const csvContent = rows.map((row) =>
        row
          .map((value) => {
            if (value === undefined || value === null) return '';
            const stringValue = value.toString();
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contact-messages-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Messages exported successfully');
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Failed to export messages');
    } finally {
      setExportLoading(false);
    }
  }, [filteredMessages, formatDate]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      setActionLoadingId(id);
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete message');
      }

      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (err) {
      console.error('Delete message error:', err);
      toast.error(err.message || 'Failed to delete message');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRead = async (msg) => {
    try {
      setActionLoadingId(msg.id);
      const response = await fetch(`/api/contact/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !msg.isRead }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update message');
      }

      toast.success(`Message marked as ${msg.isRead ? 'unread' : 'read'}`);
      fetchMessages();
    } catch (err) {
      console.error('Toggle read error:', err);
      toast.error(err.message || 'Failed to update message');
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
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData?.id) return;

    try {
      setEditLoading(true);
      const response = await fetch(`/api/contact/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update message');
      }

      toast.success('Message updated successfully');
      setEditModalOpen(false);
      setEditData(null);
      fetchMessages();
    } catch (err) {
      console.error('Edit message error:', err);
      toast.error(err.message || 'Failed to update message');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center text-base md:text-lg lg:text-xl tracking-wider font-light cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to dashboard
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Contact Centre</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={infoCardClasses}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-blue-500">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className={infoCardClasses}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Unread</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unread}</p>
              </div>
              <div className="text-amber-500">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 14H3l6.105-8.828a4 4 0 013.182-1.672h.043a4 4 0 013.183 1.718L21 14h-6l-.75 3h-4.5z" />
                </svg>
              </div>
            </div>
            <div className={infoCardClasses}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Read</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.read}</p>
              </div>
              <div className="text-green-500">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4M7 7l5-4 5 4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 10a11.05 11.05 0 01-.697 3.837A11 11 0 1112 1" />
                </svg>
              </div>
            </div>
            <div className={infoCardClasses}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Filtered</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredMessages.length}</p>
              </div>
              <div className="text-purple-500">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-8 8v6l-4-2v-4L3 6V4z" />
                </svg>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-base md:text-lg lg:text-xl tracking-wide font-semibold text-gray-900">
                    Contact Messages
                  </h3>
                  <p className="text-sm tracking-wide text-gray-500">
                    {filteredMessages.length} of {messages.length} message(s)
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExport}
                    disabled={exportLoading || filteredMessages.length === 0}
                    className={`${actionButtonClasses} bg-text-primary text-white disabled:opacity-60`}
                  >
                    {exportLoading ? 'Exporting...' : 'Export CSV'}
                  </button>
                  <button
                    onClick={fetchMessages}
                    className={`${actionButtonClasses} border border-gray-300 text-gray-700 hover:bg-gray-50`}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
                <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
                  <span>Showing</span>
                  <strong className="text-gray-900">{filteredMessages.length}</strong>
                </div>
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <h3 className="text-2xl font-light mb-2">No contact messages found</h3>
                <p className="text-base text-gray-500">
                  {searchTerm ? 'Try adjusting your search term.' : 'Messages will appear here once submitted.'}
                </p>
                {error && (
                  <button
                    onClick={fetchMessages}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Name & Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {msg.firstName} {msg.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{msg.email}</p>
                          <p className="text-xs text-gray-500">
                            {msg.countryCode} {msg.phone}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 max-w-xs line-clamp-3">
                            {msg.message}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${msg.isRead
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full mr-2"
                              style={{ backgroundColor: msg.isRead ? '#15803d' : '#b45309' }}
                            />
                            {msg.isRead ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                              {msg.isRead ? 'Mark Unread' : 'Mark Read'}
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setEditModalOpen(false);
                setEditData(null);
              }}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Message</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                  <input
                    type="text"
                    name="countryCode"
                    value={editData.countryCode}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  value={editData.message}
                  onChange={handleEditChange}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="isRead"
                  type="checkbox"
                  name="isRead"
                  checked={!!editData.isRead}
                  onChange={handleEditChange}
                  className="rounded text-blue-600"
                />
                <label htmlFor="isRead" className="text-sm text-gray-700">
                  Mark as read
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditData(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMessage && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setViewMessage(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Message Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                  <p className="text-sm text-gray-900">
                    {viewMessage.firstName} {viewMessage.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="text-sm text-gray-900">{viewMessage.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-sm text-gray-900">
                    {viewMessage.countryCode} {viewMessage.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="text-sm text-gray-900">{viewMessage.isRead ? 'Read' : 'Unread'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Submitted At</p>
                <p className="text-sm text-gray-900">{formatDate(viewMessage.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Message</p>
                <p className="text-sm text-gray-900 whitespace-pre-line">{viewMessage.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
}


