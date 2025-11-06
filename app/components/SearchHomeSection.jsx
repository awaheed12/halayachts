'use client';
import { memo, useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import SearchFilter from './SearchFilter';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';

// Loading component for search section
function HomeSearchSectionLoader() {
  return (
    <section className="2xl:pt-64 2xl:pb-24 lg:pb-5 lg:py-24 py-8 px-5 xl:relative">
      <div className="2xl:max-w-[78rem] max-w-7xl mx-auto rounded-[20px] xl:py-20 sm:py-16 py-7 2xl:absolute 2xl:w-full 2xl:right-0 2xl:left-0 2xl:-top-40 bg-white shadow-xl">
        <div className="flex flex-col sm:gap-7 gap-5 xl:px-20 px-7">
          <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="border-t border-gray-300"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-12 bg-gray-200 animate-pulse rounded w-32"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main component content
function HomeSearchSectionContent({
  heading = "2,000+ Yachts for Charter Worldwide",
  description = [
    "Choose your destination and style.",
    "We'll prepare a personalized yacht journey just for you."
  ],
  showDivider = true,
  className = "",
  headingSize = "",
  textSize = ""
}) {
  const searchParams = useSearchParams();
  
  // URL se initial filters load karo
  const [filters, setFilters] = useState({
    location: 'all',
    duration: 'all',
    length: 'all',
    budget: 'all',
    amenities: 'all',
    passengers: 'all'
  });

  const [isToastActive, setIsToastActive] = useState(false);
  const toastTimeoutRef = useRef(null);

  // URL parameters change hone par filters update karo
  useEffect(() => {
    const filtersFromUrl = {
      location: searchParams.get('location') || 'all',
      duration: searchParams.get('duration') || 'all',
      length: searchParams.get('length') || 'all',
      budget: searchParams.get('budget') || 'all',
      passengers: searchParams.get('passengers') || 'all',
      amenities: searchParams.getAll('amenities').length > 0 
        ? searchParams.getAll('amenities') 
        : 'all'
    };
    
    setFilters(filtersFromUrl);
  }, [searchParams]);

  const descriptionArray = Array.isArray(description) ? description : [description];

  // Function to format heading with animated "2,000+"
  const formatHeading = (text) => {
    const parts = text.split("2,000+");
    if (parts.length === 2) {
      return (
        <>
          <span className="text-secondary font-bold animate-pulse inline-block">
            2,000+
          </span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Generate URL with filter parameters
  const getSearchUrl = () => {
    const params = new URLSearchParams();

    if (filters.location !== 'all') params.append('location', filters.location);
    if (filters.duration !== 'all') params.append('duration', filters.duration);
    if (filters.length !== 'all') params.append('length', filters.length);
    if (filters.budget !== 'all') params.append('budget', filters.budget);
    if (filters.passengers !== 'all') params.append('passengers', filters.passengers);

    // Handle amenities array - 'all' case handle karo
    if (filters.amenities !== 'all' && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
      filters.amenities.forEach(amenity => {
        if (amenity !== 'all') {
          params.append('amenities', amenity);
        }
      });
    }

    const queryString = params.toString();
    return `/charter${queryString ? `?${queryString}` : ''}`;
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== 'all' && (!Array.isArray(value) || value.length > 0)
  );

  const handleSearchClick = (e) => {
    if (!hasActiveFilters) {
      e.preventDefault();

      // Check if toast is already active
      if (!isToastActive) {
        setIsToastActive(true);

        // Clear any existing timeout
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }

        toast.info('Please select at least one filter to search.', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,  
          closeOnClick: false,  
          pauseOnHover: false,
          draggable: false,
          className: 'custom-toast-width', 
          onClose: () => {
            setIsToastActive(false);
          }
        });

        // Set timeout to reset isToastActive after 2 seconds (same as autoClose)
        toastTimeoutRef.current = setTimeout(() => {
          setIsToastActive(false);
        }, 2000);
      }
    }
  };

  return (
    <section
      className={`2xl:pt-64 2xl:pb-24 lg:pb-5 lg:py-24 py-8 px-5 xl:relative ${className}`}
      aria-labelledby="section-heading"
    >
      {/* Custom CSS for toast width - Better approach */}
      <style jsx global>{`
        .custom-toast-width {
          max-width: 400px !important;
          width: 90% !important;
          margin: 0 auto !important;
          text-align: center !important;
        }
        .Toastify__toast {
          max-width: 400px !important;
          width: 90% !important;
          margin: 0 auto !important;
        }
        .Toastify__toast-body {
          text-align: center !important;
          justify-content: center !important;
        }
      `}</style>

      <div className="2xl:max-w-[78rem] max-w-7xl mx-auto rounded-[20px] xl:py-20 sm:py-16 py-7 2xl:absolute 2xl:w-full 2xl:right-0 2xl:left-0 2xl:-top-40 bg-white shadow-xl">
        <div className="flex flex-col sm:gap-7 gap-5 xl:px-20 px-7">
          <h2
            id="section-heading"
            className={`text-3xl md:text-6xl xl:text-[65px] font-light text-black ${headingSize}`}
          >
            {formatHeading(heading)}
          </h2>

          <div>
            {descriptionArray.map((text, index) => (
              <p
                key={index}
                className={`text-base md:text-lg lg:text-xl tracking-wider font-light ${textSize}`}
              >
                {text}
              </p>
            ))}
          </div>

          {showDivider && <div className="border-t border-gray-300" />}

          {/* Search Filters - URL se filters pass karo */}
          <div className="sm:block hidden">
            <SearchFilter 
              onFilterChange={handleFilterChange} 
              showClearAll={false} 
              initialFilters={filters}
            />
          </div>

          {/* Search Button */}
          <div className="flex sm:justify-end justify-center">
            <Link
              href={getSearchUrl()}
              onClick={handleSearchClick}
              className={`flex items-center gap-1 justify-center text-center text-base p-3 sm:w-auto w-full md:text-base font-medium rounded cursor-pointer hover:bg-opacity-90 transition duration-300 ${hasActiveFilters
                  ? 'bg-text-secondary text-white hover:bg-text-primary'
                  : 'bg-text-primary text-white hover:bg-text-secondary'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {hasActiveFilters ? 'Search' : 'Search'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main exported component with Suspense
const HomeSearchSection = (props) => {
  return (
    <Suspense fallback={<HomeSearchSectionLoader />}>
      <HomeSearchSectionContent {...props} />
    </Suspense>
  );
};

export default memo(HomeSearchSection);