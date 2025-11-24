'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function YachtForm({ yachtId, initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    id: '',
    yacht_id: '',
    title: '',
    name: '',
    slug: '',
    slugs: [],
    vessel_type: '',
    year: '',
    length: '',
    speed: '',
    guests: '',
    min_duration: '',
    tax: '',
    tax_label: '',
    refit: '',
    features_and_availablity_info: '',
    image: '',
    banner_image: '',
    amenities: [],
    brochure: { file_path: '', file_name: '' },
    specifications: {
      marina_location: '',
      refit: '',
      cruising_knots: '',
      length: '',
      beam: '',
      draft: '',
      guest_capacity: '',
      crew: '',
      bathrooms: '',
      cabins: '',
      amenities_water_toys: '',
      builder: '',
      name_of_boat: '',
      owner_name_entity_llc: '',
      captain_name: '',
      captain_email: '',
      captain_cell: '',
      contact_person_for_charters: '',
      flag: '',
      year: ''
    },
    images: [],
    location: {
      id: '',
      city: '',
      country_code: '',
      latitude: '',
      longitude: '',
      name: '',
      short_name: '',
      state_code: '',
      zip_code: ''
    },
    prices: [],
    broker: '',
    status: 'published' // 'published' or 'draft'
  });

  // Load yacht data if editing
  useEffect(() => {
    if (yachtId && yachtId !== 'new') {
      fetchYacht();
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [yachtId, initialData]);

  const fetchYacht = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/yachts/${yachtId}`);
      if (response.ok) {
        const yacht = await response.json();
        setFormData({
          id: yacht.id || '',
          yacht_id: yacht.yacht_id || '',
          title: yacht.title || '',
          name: yacht.name || '',
          slug: yacht.slug || '',
          slugs: yacht.slugs || [],
          vessel_type: yacht.vessel_type || '',
          year: yacht.year || '',
          length: yacht.length || '',
          speed: yacht.speed || '',
          guests: yacht.guests || '',
          min_duration: yacht.min_duration || '',
          tax: yacht.tax || '',
          tax_label: yacht.tax_label || '',
          refit: yacht.refit || '',
          features_and_availablity_info: yacht.features_and_availablity_info || '',
          image: yacht.image || '',
          banner_image: yacht.banner_image || '',
          amenities: yacht.amenities || [],
          brochure: yacht.brochure || { file_path: '', file_name: '' },
          specifications: yacht.specifications || {
            marina_location: '',
            refit: '',
            cruising_knots: '',
            length: '',
            beam: '',
            draft: '',
            guest_capacity: '',
            crew: '',
            bathrooms: '',
            cabins: '',
            amenities_water_toys: '',
            builder: '',
            name_of_boat: '',
            owner_name_entity_llc: '',
            captain_name: '',
            captain_email: '',
            captain_cell: '',
            contact_person_for_charters: '',
            flag: '',
            year: ''
          },
          images: yacht.images || [],
          location: yacht.location || {
            id: '',
            city: '',
            country_code: '',
            latitude: '',
            longitude: '',
            name: '',
            short_name: '',
            state_code: '',
            zip_code: ''
          },
          prices: yacht.prices || [],
          broker: yacht.broker || '',
          status: yacht.status || 'published'
        });
      }
    } catch (error) {
      console.error('Error fetching yacht:', error);
      alert('Error loading yacht data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else if (name.startsWith('brochure.')) {
      const brochureField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        brochure: {
          ...prev.brochure,
          [brochureField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayFieldChange = (fieldName, index, value) => {
    setFormData(prev => {
      const newArray = [...(prev[fieldName] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [fieldName]: newArray
      };
    });
  };

  const handleAmenityChange = (index, field, value) => {
    setFormData(prev => {
      const newAmenities = [...(prev.amenities || [])];
      if (!newAmenities[index]) {
        newAmenities[index] = { name: '', code: '' };
      }
      newAmenities[index] = {
        ...newAmenities[index],
        [field]: value
      };
      return {
        ...prev,
        amenities: newAmenities
      };
    });
  };

  const addArrayItem = (fieldName, defaultValue = {}) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), defaultValue]
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  // Handle file upload
  const handleFileUpload = async (file, fieldName, index = null) => {
    if (!file) return;

    const uploadKey = index !== null ? `${fieldName}-${index}` : fieldName;
    try {
      setUploading(prev => ({ ...prev, [uploadKey]: true }));
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload/yacht', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        if (index !== null) {
          // For array fields like images
          handleArrayFieldChange(fieldName, index, typeof formData[fieldName][index] === 'string' 
            ? result.filePath 
            : { ...formData[fieldName][index], original_url: result.filePath });
        } else {
          // For single fields like image, banner_image
          setFormData(prev => ({
            ...prev,
            [fieldName]: result.filePath
          }));
        }
      } else {
        alert(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const preparePayload = (status) => {
    return {
      ...formData,
      status,
      id: formData.id ? parseInt(formData.id) : undefined,
      yacht_id: formData.yacht_id ? parseInt(formData.yacht_id) : undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      length: formData.length ? parseFloat(formData.length) : undefined,
      speed: formData.speed ? parseFloat(formData.speed) : undefined,
      guests: formData.guests ? parseInt(formData.guests) : undefined,
      min_duration: formData.min_duration ? parseInt(formData.min_duration) : undefined,
      tax: formData.tax ? parseFloat(formData.tax) : undefined,
      location: {
        ...formData.location,
        id: formData.location.id ? parseInt(formData.location.id) : undefined,
        latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : undefined,
        longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : undefined
      },
      prices: formData.prices.filter(p => p && Object.keys(p).length > 0),
      amenities: formData.amenities.filter(a => a && (a.name || a.code)),
      images: formData.images.filter(img => {
        if (typeof img === 'string') return img.trim();
        if (typeof img === 'object' && img) return img.original_url || img.id;
        return false;
      }).map(img => {
        if (typeof img === 'string') return { id: 0, original_url: img };
        return img;
      }),
      slugs: formData.slugs.filter(s => s && s.trim())
    };
  };

  const handleSubmit = async (e, status = 'published') => {
    e.preventDefault();
    try {
      setLoading(true);
      const yachtPayload = preparePayload(status);

      const url = yachtId && yachtId !== 'new' 
        ? `/api/yachts/${yachtId}`
        : '/api/yachts';
      const method = yachtId && yachtId !== 'new' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(yachtPayload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(status === 'draft' ? 'Yacht saved as draft!' : (yachtId && yachtId !== 'new' ? 'Yacht updated successfully!' : 'Yacht added successfully!'));
        router.push('/admin/dashboard/yachts');
      } else {
        alert(result.error || 'Failed to save yacht');
      }
    } catch (error) {
      console.error('Error saving yacht:', error);
      alert('Error saving yacht');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    try {
      setSavingDraft(true);
      const yachtPayload = preparePayload('draft');

      const url = yachtId && yachtId !== 'new' 
        ? `/api/yachts/${yachtId}`
        : '/api/yachts';
      const method = yachtId && yachtId !== 'new' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(yachtPayload),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Yacht saved as draft!');
        if (yachtId === 'new') {
          // If it's a new draft, redirect to edit page with the new ID
          const newId = result.yacht?._id || result.yacht?.id;
          if (newId) {
            router.push(`/admin/dashboard/yachts/${newId}`);
          } else {
            router.push('/admin/dashboard/yachts');
          }
        }
      } else {
        alert(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft');
    } finally {
      setSavingDraft(false);
    }
  };

  if (loading && yachtId && yachtId !== 'new') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="h-10 w-10 border-4 border-gray-200 border-t-[#c8a75c] rounded-full animate-spin"
            aria-label="Loading spinner"
          />
          <p className="text-sm text-gray-500 tracking-wide">Loading yacht data...</p>
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
              <Link href="/admin/dashboard/yachts" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-light tracking-wide text-gray-800">
                  {yachtId && yachtId !== 'new' ? 'Edit Yacht' : 'Add New Yacht'}
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft || loading}
                className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-500 text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-offset-2 tracking-wide transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingDraft ? 'Saving...' : 'Save as Draft'}
              </button>
              <Link
                href="/admin/dashboard/yachts"
                className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-500 text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-offset-2 tracking-wide transition cursor-pointer"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        <form onSubmit={(e) => handleSubmit(e, formData.status)} className="space-y-6">
          {/* Status Toggle */}
          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status === 'published'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))}
                className="w-5 h-5 text-[#c8a75c] focus:ring-[#c8a75c] rounded cursor-pointer"
              />
              <span className="text-base font-semibold tracking-wide text-gray-800">Publish immediately</span>
            </label>
            <p className="text-sm text-gray-500 mt-2 ml-8 tracking-wide">Uncheck to save as draft</p>
          </div>

          {/* Section 1: Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  ID
                </label>
                <input
                  type="number"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Yacht ID
                </label>
                <input
                  type="number"
                  name="yacht_id"
                  value={formData.yacht_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., Sirena 88"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., Duchess"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., sirena-88"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Vessel Type
                </label>
                <input
                  type="text"
                  name="vessel_type"
                  value={formData.vessel_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., Motor Yacht"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 2000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Length (ft)
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 65"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Speed (knots)
                </label>
                <input
                  type="number"
                  name="speed"
                  value={formData.speed}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 21"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Max Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 116"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Min Duration (hours)
                </label>
                <input
                  type="number"
                  name="min_duration"
                  value={formData.min_duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 4"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 6"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Tax Label
                </label>
                <input
                  type="text"
                  name="tax_label"
                  value={formData.tax_label}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., Tax"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Refit
                </label>
                <input
                  type="text"
                  name="refit"
                  value={formData.refit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Refit information"
                />
              </div>
              <div>
                <label className="block text-base font-semibold tracking-wider capitalize text-gray-700 mb-2">
                  Main Image
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                      placeholder="/images/charter/mangusta_01.png or upload file"
                    />
                    <label className="px-4 py-2 bg-[#c8a75c] text-white rounded-lg text-sm tracking-wide hover:bg-[#b8974c] transition cursor-pointer inline-flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {uploading['image'] ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={formData.image}
                        alt="Main image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-gray-400 text-sm tracking-wide">
                        Image preview unavailable
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold tracking-wider capitalize text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="banner_image"
                      value={formData.banner_image}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                      placeholder="/images/charter/banner_mangusta_01.png or upload file"
                    />
                    <label className="px-4 py-2 bg-[#c8a75c] text-white rounded-lg text-sm tracking-wide hover:bg-[#b8974c] transition cursor-pointer inline-flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {uploading['banner_image'] ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'banner_image')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.banner_image && (
                    <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={formData.banner_image}
                        alt="Banner image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-gray-400 text-sm tracking-wide">
                        Image preview unavailable
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Broker
                </label>
                <input
                  type="text"
                  name="broker"
                  value={formData.broker}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Broker name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold tracking-wide capitalize text-gray-700 mb-2">
                  Features & Availability Info
                </label>
                <textarea
                  name="features_and_availablity_info"
                  value={formData.features_and_availablity_info}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition resize-y"
                  placeholder="Features description..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location Information */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Location Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Location ID</label>
                <input
                  type="number"
                  name="location.id"
                  value={formData.location.id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., 456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., Nassau, The Bahamas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Country Code</label>
                <input
                  type="text"
                  name="location.country_code"
                  value={formData.location.country_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., US"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Latitude</label>
                <input
                  type="text"
                  name="location.latitude"
                  value={formData.location.latitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., 33.980289"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Longitude</label>
                <input
                  type="text"
                  name="location.longitude"
                  value={formData.location.longitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., -118.451745"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Full Name</label>
                <input
                  type="text"
                  name="location.name"
                  value={formData.location.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., Nassau, The Bahamas, CA, United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Short Name</label>
                <input
                  type="text"
                  name="location.short_name"
                  value={formData.location.short_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., Nassau, The Bahamas, CA, United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">State Code</label>
                <input
                  type="text"
                  name="location.state_code"
                  value={formData.location.state_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Zip Code</label>
                <input
                  type="text"
                  name="location.zip_code"
                  value={formData.location.zip_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                  placeholder="e.g., 90292"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Brochure */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Brochure</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">File Path</label>
                <input
                  type="text"
                  name="brochure.file_path"
                  value={formData.brochure.file_path}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="/images/sirena-88.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">File Name</label>
                <input
                  type="text"
                  name="brochure.file_name"
                  value={formData.brochure.file_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="sirena-88-brochure.pdf"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Slugs */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Additional Slugs</h4>
            <div className="space-y-3">
              {formData.slugs.map((slug, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleArrayFieldChange('slugs', index, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                    placeholder="Additional slug"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('slugs', index)}
                    className="px-4 py-2.5 text-red-600 text-sm tracking-wide hover:text-red-800 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('slugs', '')}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-[#c8a75c] text-sm tracking-wide hover:border-[#c8a75c] hover:bg-[#c8a75c] hover:text-white transition font-medium"
              >
                + Add Slug
              </button>
            </div>
          </div>

          {/* Section 5: Prices */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Pricing Information</h4>
            <div className="space-y-4">
              {formData.prices.map((price, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Currency</label>
                      <input
                        type="text"
                        placeholder="e.g., $"
                        value={price.retail_currency || ''}
                        onChange={(e) => handleArrayFieldChange('prices', index, { ...price, retail_currency: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Retail Cents</label>
                      <input
                        type="number"
                        placeholder="e.g., 250000"
                        value={price.retail_cents || ''}
                        onChange={(e) => handleArrayFieldChange('prices', index, { ...price, retail_cents: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Charter Hours</label>
                      <input
                        type="number"
                        placeholder="e.g., 3"
                        value={price.charter_hours || ''}
                        onChange={(e) => handleArrayFieldChange('prices', index, { ...price, charter_hours: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Hours Label</label>
                      <input
                        type="text"
                        placeholder="e.g., hrs"
                        value={price.charter_hours_label || ''}
                        onChange={(e) => handleArrayFieldChange('prices', index, { ...price, charter_hours_label: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Label</label>
                      <input
                        type="text"
                        placeholder="e.g., 4 hrs"
                        value={price.label || ''}
                        onChange={(e) => handleArrayFieldChange('prices', index, { ...price, label: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Half Day / Full Day</label>
                      <input
                        type="text"
                        placeholder="e.g., Half Day Rate or Full Day Rate"
                        value={price.half_day || price.full_day || ''}
                        onChange={(e) => handleArrayFieldChange('prices', index, { ...price, half_day: e.target.value, full_day: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('prices', index)}
                    className="text-red-600 text-sm tracking-wide hover:text-red-800 font-medium transition"
                  >
                    Remove Price
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('prices', { retail_currency: '', retail_cents: 0, charter_hours: 0, charter_hours_label: '', label: '', half_day: '', full_day: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#c8a75c] text-sm tracking-wide hover:border-[#c8a75c] hover:bg-[#c8a75c] hover:text-white transition font-medium"
              >
                + Add Price
              </button>
            </div>
          </div>

          {/* Section 6: Amenities */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Amenities</h4>
            <div className="space-y-4">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Name</label>
                      <input
                        type="text"
                        value={typeof amenity === 'object' ? (amenity.name || '') : ''}
                        onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                        placeholder="e.g., Jacuzzi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Code</label>
                      <input
                        type="text"
                        value={typeof amenity === 'object' ? (amenity.code || '') : ''}
                        onChange={(e) => handleAmenityChange(index, 'code', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                        placeholder="e.g., icon-wifi"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('amenities', index)}
                    className="mt-3 text-red-600 text-sm tracking-wide hover:text-red-800 font-medium transition"
                  >
                    Remove Amenity
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('amenities', { name: '', code: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#c8a75c] text-sm tracking-wide hover:border-[#c8a75c] hover:bg-[#c8a75c] hover:text-white transition font-medium"
              >
                + Add Amenity
              </button>
            </div>
          </div>

          {/* Section 7: Gallery Images */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-4 tracking-wider border-b border-gray-200 pb-2 text-gray-800">Gallery Images</h4>
            <div className="space-y-4">
              {formData.images.map((img, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Image ID</label>
                      <input
                        type="number"
                        value={typeof img === 'object' ? (img.id || '') : ''}
                        onChange={(e) => handleArrayFieldChange('images', index, typeof img === 'string' ? { id: parseInt(e.target.value) || 0, original_url: '' } : { ...img, id: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={typeof img === 'string' ? img : (img.original_url || '')}
                          onChange={(e) => handleArrayFieldChange('images', index, typeof img === 'string' ? e.target.value : { ...img, original_url: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent"
                          placeholder="/images/charter/image01.png"
                        />
                        <label className="px-3 py-2 bg-[#c8a75c] text-white rounded-lg text-sm tracking-wide hover:bg-[#b8974c] transition cursor-pointer inline-flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          {uploading[`images-${index}`] ? '...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'images', index)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Preview</label>
                      {(typeof img === 'string' ? img : img.original_url) && (
                        <div className="relative w-full h-20 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={typeof img === 'string' ? img : img.original_url}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center text-gray-400 text-xs tracking-wide">
                            No preview
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('images', index)}
                    className="mt-3 text-red-600 text-sm tracking-wide hover:text-red-800 font-medium transition"
                  >
                    Remove Image
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('images', { id: 0, original_url: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#c8a75c] text-sm tracking-wide hover:border-[#c8a75c] hover:bg-[#c8a75c] hover:text-white transition font-medium"
              >
                + Add Gallery Image
              </button>
            </div>
          </div>

          {/* Section 8: Specifications */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold mb-6 tracking-wider border-b border-gray-200 pb-3 text-gray-800">Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Marina Location</label>
                <input
                  type="text"
                  name="specifications.marina_location"
                  value={formData.specifications.marina_location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Marina location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Refit</label>
                <input
                  type="text"
                  name="specifications.refit"
                  value={formData.specifications.refit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Refit information"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Cruising Knots</label>
                <input
                  type="text"
                  name="specifications.cruising_knots"
                  value={formData.specifications.cruising_knots}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Cruising speed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Length</label>
                <input
                  type="text"
                  name="specifications.length"
                  value={formData.specifications.length}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="e.g., 150ft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Beam</label>
                <input
                  type="text"
                  name="specifications.beam"
                  value={formData.specifications.beam}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Beam width"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Draft</label>
                <input
                  type="text"
                  name="specifications.draft"
                  value={formData.specifications.draft}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Draft depth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Guest Capacity</label>
                <input
                  type="text"
                  name="specifications.guest_capacity"
                  value={formData.specifications.guest_capacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Guest capacity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Crew</label>
                <input
                  type="text"
                  name="specifications.crew"
                  value={formData.specifications.crew}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Crew size"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Bathrooms</label>
                <input
                  type="text"
                  name="specifications.bathrooms"
                  value={formData.specifications.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Number of bathrooms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Cabins</label>
                <input
                  type="text"
                  name="specifications.cabins"
                  value={formData.specifications.cabins}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Number of cabins"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Water Toys & Amenities</label>
                <input
                  type="text"
                  name="specifications.amenities_water_toys"
                  value={formData.specifications.amenities_water_toys}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Water toys description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Builder</label>
                <input
                  type="text"
                  name="specifications.builder"
                  value={formData.specifications.builder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Yacht builder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Name of Boat</label>
                <input
                  type="text"
                  name="specifications.name_of_boat"
                  value={formData.specifications.name_of_boat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Boat name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Owner Name/Entity/LLC</label>
                <input
                  type="text"
                  name="specifications.owner_name_entity_llc"
                  value={formData.specifications.owner_name_entity_llc}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Owner information"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Captain Name</label>
                <input
                  type="text"
                  name="specifications.captain_name"
                  value={formData.specifications.captain_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Captain name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Captain Email</label>
                <input
                  type="email"
                  name="specifications.captain_email"
                  value={formData.specifications.captain_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="captain@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Captain Cell</label>
                <input
                  type="text"
                  name="specifications.captain_cell"
                  value={formData.specifications.captain_cell}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Contact Person for Charters</label>
                <input
                  type="text"
                  name="specifications.contact_person_for_charters"
                  value={formData.specifications.contact_person_for_charters}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Flag</label>
                <input
                  type="text"
                  name="specifications.flag"
                  value={formData.specifications.flag}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Flag country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Year (Specifications)</label>
                <input
                  type="text"
                  name="specifications.year"
                  value={formData.specifications.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#c8a75c] focus:border-transparent transition"
                  placeholder="Year"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col sm:flex-row gap-4 justify-end items-stretch sm:items-center">
            <Link
              href="/admin/dashboard/yachts"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg text-sm font-medium tracking-wide hover:bg-gray-700 transition cursor-pointer text-center"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || loading}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg text-sm font-medium tracking-wide hover:bg-gray-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingDraft ? 'Saving Draft...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={loading || savingDraft}
              className="px-8 py-3 bg-[#c8a75c] text-white rounded-lg text-sm font-medium tracking-wide hover:bg-[#b8974c] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Saving...' : (yachtId && yachtId !== 'new' ? 'Update Yacht' : 'Publish Yacht')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

