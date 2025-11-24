'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LocationsManagement() {
  const [isReady, setIsReady] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [editingLocation, setEditingLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    image: ''
  });
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
      fetchLocations();
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      router.push('/admin');
    }
  }, [router]);

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      } else {
        console.error('Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          image: result.filePath
        }));
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  // Filter and sort locations
  const filteredAndSortedLocations = useCallback(() => {
    let filtered = locations.filter(location =>
      location.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'id':
          return a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [locations, searchTerm, sortBy]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new location
  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchLocations();
        setShowAddForm(false);
        setFormData({ id: '', title: '', image: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add location');
      }
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Error adding location');
    }
  };

  // Update location
  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/locations/${editingLocation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          image: formData.image
        }),
      });

      if (response.ok) {
        await fetchLocations();
        setEditingLocation(null);
        setFormData({ id: '', title: '', image: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error updating location');
    }
  };

  // Delete location
  const handleDeleteLocation = async (locationId) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        const response = await fetch(`/api/locations/${locationId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchLocations();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to delete location');
        }
      } catch (error) {
        console.error('Error deleting location:', error);
        alert('Error deleting location');
      }
    }
  };

  // Start editing a location
  const startEditing = (location) => {
    setEditingLocation(location);
    setFormData({
      id: location.id,
      title: location.title,
      image: location.image
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingLocation(null);
    setFormData({ id: '', title: '', image: '' });
  };

  // Cancel adding
  const cancelAdding = () => {
    setShowAddForm(false);
    setFormData({ id: '', title: '', image: '' });
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
                <h1 className="text-2xl font-light tracking-wider">
                  Locations Management
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-lg text-base font-light bg-text-primary text-white shadow-sm hover:bg-text-primary focus:outline-none focus:ring-offset-2 focus:bg-text-primary tracking-wide transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-3xl lg:text-6xl tracking-wider">
              Manage Locations
            </h2>
            <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
              Add, edit, or delete locations for your website.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg tracking-wider focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border bg-white border-gray-300 rounded-lg tracking-wider focus:border-transparent"
              >
                <option className='tracking-wide font-light' value="title">Sort by Title</option>
                <option className='tracking-wide font-light' value="id">Sort by ID</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-text-primary tracking-wider font-medium text-white rounded-lg hover:bg-text-primary transition cursor-pointer"
            >
              Add New Location
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingLocation) && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold tracking-wider capitalize mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h3>
            <form onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold tracking-wider capitalize text-gray-700 mb-2">
                    Location ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    required
                    disabled={editingLocation} // Can't edit ID when updating
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-semibold tracking-wider   focus:border-transparent disabled:bg-gray-100"
                    placeholder="e.g., miami"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold tracking-wider capitalize text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-semibold tracking-wider   focus:border-transparent"
                    placeholder="e.g., Miami, Florida"
                  />
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-base font-semibold tracking-wider capitalize text-gray-700 mb-2">
                  Location Image
                </label>
                
                {/* Image Preview */}
                {formData.image && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00NCA0NEg4NEM4Ni4yMDkxIDQ0IDg4IDQ1Ljc5MDkgODggNDhWODBDODggODIuMjA5MSA4Ni4yMDkxIDg0IDg0IDg0SDQ0QzQxLjc5MDkgODQgNDAgODIuMjA5MSA0MCA4MFY0OEM0MCA0NS43OTA5IDQxLjc5MDkgNDQgNDQgNDRaIiBmaWxsPSIjOEU5MEEzIi8+CjxjaXJjbGUgY3g9IjU2IiBjeT0iNTYiIHI9IjgiIGZpbGw9IiNGOEY5RkEiLz4KPHBhdGggZD0iTTg4IDg0TDEyOCA0NFY4MEMxMjggODIuMjA5MSAxMjYuMjA5MSA4NCAxMjQgODRIODhaIiBmaWxsPSIjOEU5MEEzIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* File Upload Input */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="flex-1 px-3 py-2 border text-base font-semibold tracking-wider  border-gray-300 rounded-lg  focus:border-transparent"
                  />
                  {uploading && (
                    <div className="flex items-center text-gray-500">
                      <div className="w-4 h-4 border-2 text-base font-semibold tracking-wider  border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2" />
                      Uploading...
                    </div>
                  )}
                </div>
                <p className="text-base font-light tracking-wider mt-1">
                  Supported formats: JPEG, PNG, WebP (Max 5MB)
                </p>
                
                {/* Current Image URL (for reference) */}
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-base tracking-wider text-gray-600">Image URL:</p>
                    <input
                      type="text"
                      value={formData.image}
                      readOnly
                      className="w-full px-3 py-2 text-base tracking-wider border border-gray-300 rounded bg-gray-50 mt-1"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading || !formData.image}
                  className="px-6 py-2 bg-[#c8a75c] text-white rounded-lg text-base tracking-wider hover:bg-[#c8a75c] disabled:bg-[#c8a75c] disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  type="button"
                  onClick={editingLocation ? cancelEditing : cancelAdding}
                  className="px-6 py-2 bg-[#c8a75c] text-white rounded-lg text-base tracking-wider hover:bg-gray-600 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div
                className="h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
                aria-label="Loading spinner"
              />
              <p className="text-sm text-gray-500 tracking-wide">Loading locations...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedLocations().map((location) => (
                  <tr key={location._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-base capitalize tracking-wider font-medium text-gray-900">
                      {location.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base capitalize tracking-wider text-gray-500">
                      {location.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 border rounded overflow-hidden flex items-center justify-center bg-gray-100">
                          <img 
                            src={location.image} 
                            alt={location.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMiAyMkg0MkM0My4xMDQ2IDIyIDQ0IDIyLjg5NTQgNDQgMjRWNDBDNDQgNDEuMTA0NiA0My4xMDQ2IDQyIDQyIDQySDIyQzIwLjg5NTQgNDIgMjAgNDEuMTA0NiAyMCA0MFYyNEMyMCAyMi44OTU0IDIwLjg5NTQgMjIgMjIgMjJaIiBmaWxsPSIjOEU5MEEzIi8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjgiIHI9IjQiIGZpbGw9IiNGOEY5RkEiLz4KPHBhdGggZD0iTTQyIDQyTDY0IDIyVjQwQzY0IDQxLjEwNDYgNjMuMTA0NiA0MiA2MiA0Mkg0MloiIGZpbGw9IiM4RTkwQTMiLz4KPC9zdmc+Cg==';
                            }}
                          />
                        </div>
                        {/* <span className="text-base tracking-wider text-gray-500 truncate max-w-xs">
                          {location.image.split('/').pop()}
                        </span> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base tracking-wider font-medium space-x-2">
                      <button
                        onClick={() => startEditing(location)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location._id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAndSortedLocations().length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-2xl tracking-wider">No locations found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}