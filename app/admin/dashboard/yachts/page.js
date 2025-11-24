'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function YachtsManagement() {
  const [isReady, setIsReady] = useState(false);
  const [yachts, setYachts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();

  // Guard admin routes
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
      fetchYachts();
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      router.push('/admin');
    }
  }, [router]);

  // Fetch yachts from API
  const fetchYachts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/yachts');
      if (response.ok) {
        const data = await response.json();
        setYachts(data);
      } else {
        console.error('Failed to fetch yachts');
      }
    } catch (error) {
      console.error('Error fetching yachts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort yachts
  const filteredAndSortedYachts = useCallback(() => {
    let filtered = yachts.filter(yacht => {
      const matchesSearch = yacht.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        yacht.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        yacht.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || yacht.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'slug':
          return (a.slug || '').localeCompare(b.slug || '');
        case 'location':
          return (a.location?.city || '').localeCompare(b.location?.city || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [yachts, searchTerm, sortBy, statusFilter]);

  // Delete yacht
  const handleDeleteYacht = async (yachtId) => {
    if (confirm('Are you sure you want to delete this yacht? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/yachts/${yachtId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (response.ok) {
          await fetchYachts();
          alert('Yacht deleted successfully!');
        } else {
          alert(result.error || 'Failed to delete yacht');
        }
      } catch (error) {
        console.error('Error deleting yacht:', error);
        alert('Error deleting yacht');
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      setExportLoading(true);
      const filtered = filteredAndSortedYachts();

      const headers = [
        'Title',
        'Slug',
        'Name',
        'Vessel Type',
        'Year',
        'Length (ft)',
        'Speed (knots)',
        'Max Guests',
        'Location',
        'Broker',
        'Status',
        'Created At',
        'Updated At'
      ];

      const csvData = filtered.map((yacht) => [
        yacht.title || '',
        yacht.slug || '',
        yacht.name || '',
        yacht.vessel_type || '',
        yacht.year || '',
        yacht.length || '',
        yacht.speed || '',
        yacht.guests || '',
        yacht.location?.city || yacht.location?.name || '',
        yacht.broker || '',
        yacht.status || 'published',
        yacht.createdAt ? new Date(yacht.createdAt).toLocaleDateString() : '',
        yacht.updatedAt ? new Date(yacht.updatedAt).toLocaleDateString() : ''
      ]);

      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...csvData.map(row => row.map(field => {
          const value = field === null || field === undefined ? '' : field.toString();
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yachts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('Yachts exported successfully!');
    } catch (error) {
      console.error('Error exporting yachts:', error);
      alert('Error exporting yachts');
    } finally {
      setExportLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('adminLoggedIn');
      router.push('/admin');
    } catch (error) {
      console.error('Error during logout:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f2f2] via-[#f2f2f2] to-[#f2f2f2]">
      <header className="border-b border-[#f2f2f2] bg-[#f2f2f2] backdrop-blur mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-light tracking-wide text-gray-800">
                  Yachts Management
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-[#c8a75c] text-white shadow-sm hover:bg-[#b8974c] focus:outline-none focus:ring-offset-2 tracking-wide transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl md:text-4xl lg:text-5xl tracking-wide font-light text-gray-800">
              Manage Yachts
            </h2>
            <p className="text-sm md:text-base tracking-wide font-light text-gray-600">
              Add, edit, or delete yachts for your website.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-5 rounded-lg shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search yachts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border bg-white border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border bg-white border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
              >
                <option className='tracking-wide font-light' value="all">All Status</option>
                <option className='tracking-wide font-light' value="published">Published</option>
                <option className='tracking-wide font-light' value="draft">Draft</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border bg-white border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
              >
                <option className='tracking-wide font-light' value="title">Sort by Title</option>
                <option className='tracking-wide font-light' value="slug">Sort by Slug</option>
                <option className='tracking-wide font-light' value="location">Sort by Location</option>
              </select>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {/* Export Button */}
              <button
                onClick={exportToCSV}
                disabled={exportLoading || loading}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gray-600 text-white rounded-lg text-sm tracking-wide font-medium hover:bg-gray-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>

              {/* Add Button */}
              <Link
                href="/admin/dashboard/yachts/new"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#c8a75c] tracking-wide font-medium text-white rounded-lg hover:bg-[#b8974c] transition cursor-pointer inline-flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New Yacht
              </Link>
            </div>
          </div>
        </div>

        {/* Yachts Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div
                className="h-12 w-12 border-4 border-gray-200 border-t-[#c8a75c] rounded-full animate-spin"
                aria-label="Loading spinner"
              />
              <p className="text-sm text-gray-500 tracking-wide font-light">Loading yachts...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Guests
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedYachts().map((yacht) => (
                    <tr key={yacht._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-20 w-28 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {yacht.image ? (
                            <img
                              src={yacht.image}
                              alt={yacht.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${yacht.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-gray-400 text-xs tracking-wide`}>
                            No Image
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium tracking-wide text-gray-900 capitalize">
                          {yacht.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm tracking-wide text-gray-500 font-mono">
                          {yacht.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm tracking-wide text-gray-500 capitalize">
                          {yacht.location?.city || yacht.location?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm tracking-wide text-gray-500">
                          {yacht.guests || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full tracking-wide ${
                          yacht.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {yacht.status || 'published'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/admin/dashboard/yachts/${yacht._id}`}
                            className="text-[#c8a75c] hover:text-[#b8974c] cursor-pointer tracking-wide transition font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteYacht(yacht._id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer tracking-wide transition font-medium"
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

            {filteredAndSortedYachts().length === 0 && (
              <div className="text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg tracking-wide font-light">No yachts found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
