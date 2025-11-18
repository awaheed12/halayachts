'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const itemsPerPage = 10;

  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) router.push('/admin');
    else fetchSubscribers();
  }, [router]);

  // Safe JSON parser with error handling
  const safeJsonParse = async (response) => {
    try {
      const text = await response.text();
      if (!text) {
        return { success: false, error: 'Empty response from server' };
      }
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Invalid response format from server'
      };
    }
  };

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscribers');

      if (!response.ok) {
        const errorData = await safeJsonParse(response);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await safeJsonParse(response);

      if (data.success) {
        setSubscribers(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Fetch subscribers error:', error);
      const errorMessage = error.message || 'Network error. Please check your connection.';
      setError(errorMessage);
      toast.error(errorMessage);
      setSubscribers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (email) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const response = await fetch(`/api/subscribers?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.success) {
        toast.success('Subscriber deleted successfully');
        fetchSubscribers();
      } else {
        throw new Error(data.error || 'Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error deleting subscriber');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) {
      toast.error('Please select subscribers to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscribers?`)) return;

    try {
      let successfulDeletes = 0;
      let failedDeletes = 0;

      for (const email of selectedSubscribers) {
        try {
          const response = await fetch(`/api/subscribers?email=${encodeURIComponent(email)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          const data = await safeJsonParse(response);

          if (response.ok && data.success) {
            successfulDeletes++;
          } else {
            failedDeletes++;
            console.error(`Failed to delete ${email}:`, data.error);
          }
        } catch (error) {
          failedDeletes++;
          console.error(`Error deleting ${email}:`, error);
        }
      }

      if (successfulDeletes > 0) {
        toast.success(`${successfulDeletes} subscribers deleted successfully`);
        setSelectedSubscribers([]);
        fetchSubscribers();
      }

      if (failedDeletes > 0) {
        toast.error(`${failedDeletes} subscribers failed to delete`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Error deleting subscribers');
    }
  };

  const handleSelectAll = (e) => {
    setSelectedSubscribers(e.target.checked ? filteredSubscribers.map(sub => sub.email) : []);
  };

  const handleSelectSubscriber = (email) => {
    setSelectedSubscribers(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      const csvContent = [
        ['Email', 'Name', 'Subscription Date', 'Status'],
        ...filteredSubscribers.map(sub => [
          sub.email,
          sub.name || '',
          formatDate(sub.subscribedAt),
          sub.status || 'active'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Subscribers exported successfully');
    } catch (error) {
      toast.error('Error exporting subscribers');
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleSortChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, []);

  // Filter and sort subscribers
  const filteredSubscribers = useMemo(() => {
    return [...subscribers].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.subscribedAt || b.createdAt) - new Date(a.subscribedAt || a.createdAt);
        case 'oldest':
          return new Date(a.subscribedAt || a.createdAt) - new Date(b.subscribedAt || b.createdAt);
        case 'name_asc':
          return (a.name || a.email).localeCompare(b.name || b.email);
        case 'name_desc':
          return (b.name || b.email).localeCompare(a.name || a.email);
        case 'email_asc':
          return a.email.localeCompare(b.email);
        case 'email_desc':
          return b.email.localeCompare(a.email);
        default:
          return new Date(b.subscribedAt || b.createdAt) - new Date(a.subscribedAt || a.createdAt);
      }
    });
  }, [subscribers, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscribers = useMemo(() => {
    return filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubscribers, startIndex, itemsPerPage]);

  // UI Components as separate variables (not inside render)
  const Header = () => (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center text-base md:text-lg lg:text-xl tracking-wider font-light cursor-pointer"
          > 
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Hala yachts Dashboard
          </button>
        </div>
      </div>
    </header>
  );

  const SearchAndActions = () => (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
      <select
        value={sortOrder}
        onChange={handleSortChange}
        className="cursor-pointer flex items-center py-2 px-4 border rounded hover:bg-opacity-90 transition duration-300 font-light tracking-wider"
      >
        <option value="newest" className='text-base tracking-wider font-light'>Newest First</option>
        <option value="oldest" className='text-base tracking-wider font-light'>Oldest First</option>
        <option value="name_asc" className='text-base tracking-wider font-light'>Name A-Z</option>
        <option value="name_desc" className='text-base tracking-wider font-light'>Name Z-A</option>
        <option value="email_asc" className='text-base tracking-wider font-light'>Email A-Z</option>
        <option value="email_desc" className='text-base tracking-wider font-light'>Email Z-A</option>
      </select>

      <button
        onClick={exportToCSV}
        disabled={exportLoading || filteredSubscribers.length === 0}
        className="cursor-pointer flex items-center bg-text-primary text-white py-2 px-4 rounded hover:bg-opacity-90 transition duration-300 font-light tracking-wider"
      >
        {exportLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </>
        )}
      </button>

      <button
        onClick={fetchSubscribers}
        className="cursor-pointer flex items-center bg-text-primary text-white py-2 px-4 rounded hover:bg-opacity-90 transition duration-300 font-light tracking-wider"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  );

  const BulkActions = () => (
    selectedSubscribers.length > 0 && (
      <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-base tracking-wider font-light">
            {selectedSubscribers.length} subscriber(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="cursor-pointer flex items-center px-3 py-1  tracking-wider font-light bg-red-600 text-white text-base rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
    )
  );

  const TableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="w-4 px-6 py-3">
          <input
            type="checkbox"
            checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </th>
        <th scope="col" className="px-6 py-3 text-left text-base tracking-wider font-medium">
          Email
        </th>
        <th scope="col" className="px-6 py-3 text-left text-base tracking-wider font-medium">
          Subscription Date
        </th>
        <th scope="col" className="px-6 py-3 text-left text-base tracking-wider font-medium">
          Status
        </th>
        <th scope="col" className="px-6 py-3 text-left text-base tracking-wider font-medium">
          Actions
        </th>
      </tr>
    </thead>
  );

  const TableRow = ({ subscriber }) => (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedSubscribers.includes(subscriber.email)}
          onChange={() => handleSelectSubscriber(subscriber.email)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <div className="text-base tracking-wider font-light">{subscriber.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base tracking-wider font-light">{formatDate(subscriber.subscribedAt || subscriber.createdAt)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 inline-flex text-base tracking-wider font-lightrounded bg-green-100 text-green-800">
          {subscriber.status || 'active'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => handleDelete(subscriber.email)}
          className="text-red-600 text-base tracking-wider font-light cursor-pointer hover:text-red-900 transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </td>
    </tr>
  );

  const Pagination = () => (
    totalPages > 1 && (
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSubscribers.length)}</span>{' '}
            of <span className="font-medium">{filteredSubscribers.length}</span> results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  );

  const EmptyState = () => (
    <div className="px-6 py-12 text-center flex flex-col gap-2.5">
      <h3 className="text-3xl md:text-6xl xl:text-6xl font-light leading-tight">No subscribers found</h3>
      <p className="text-base md:text-lg lg:text-xl tracking-wider font-light opacity-90">
        Get started by adding your first subscriber.
      </p>
      {error && (
        <button
          onClick={fetchSubscribers}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Retry Connection
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8a75c] mb-4"></div>
          <p className="text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header with Actions */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-base md:text-lg lg:text-xl tracking-wider font-light">Subscribers List</h3>
                  <p className="text-base tracking-wider font-light">
                    {filteredSubscribers.length} of {subscribers.length} subscribers
                  </p>
                  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>
                <SearchAndActions />
              </div>
            </div>

            <BulkActions />

            {filteredSubscribers.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <TableHeader />
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSubscribers.map((subscriber) => (
                        <TableRow key={subscriber._id || subscriber.email} subscriber={subscriber} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </>
            )}
          </div>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
}