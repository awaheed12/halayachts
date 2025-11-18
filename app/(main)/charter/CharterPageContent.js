"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import Banner from "../../components/Banner";
import yachts from '../../../data/yachts.json';
import YachtCard from "../../components/YachtCard";
import SearchFilter from "../../components/SearchFilter";
import { GoArrowRight, GoArrowLeft, GoArrowUpRight } from "react-icons/go";
import { useSearchParams } from 'next/navigation';
import PerfectYachtBanner from '../../components/PerfectYachtBanner';
import Link from 'next/link';
import LocationCard from '../../components/LocationCard';
import locationsData from "../../../data/locations.json";

// Pagination Component
const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
      <div className="text-base md:text-lg lg:text-xl sm:max-w-[95%] tracking-wider font-light">
        <span className="font-medium">{startItem} to {endItem}</span>
        <span className="mx-1">Yachts of</span>
        <span className="font-medium text-secondary">{totalItems}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg border transition-all duration-200 p-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Previous page"
        >
          <GoArrowLeft />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`min-w-[40px] h-10 px-3 rounded-lg border transition-all duration-200 cursor-pointer ${page === currentPage
                ? 'bg-text-secondary  text-white border-secondary shadow-sm'
                : page === '...'
                  ? 'border-transparent cursor-default text-gray-500'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400'
                }`}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg border transition-all duration-200 p-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Next page"
        >
          <GoArrowRight />
        </button>
      </div>
    </div>
  );
};

// Grid configurations
const LOCATIONS_GRID_CONFIG = {
  base: "grid-cols-1",
  md: "md:grid-cols-2", 
  lg: "lg:grid-cols-3", 
  gap: "gap-8"
};

const Exclusive_Locations = {
  title: "Exclusive Locations",
  description:
    "Sail to the world's most breathtaking destinations, surrounded by the comfort and seclusion of your private yacht. Where every horizon is yours to explore in complete comfort.",
  viewMore: {
    text: "View more",
    link: "/location",
  },
};

// Main CharterPage Component
export default function CharterPageContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    location: 'all',
    duration: 'all',
    length: 'all',
    budget: 'all',
    amenities: 'all',
    passengers: 'all'
  });

  const itemsPerPage = 12;
  const yachtGridRef = useRef(null);

  // URL se filters receive karein
  useEffect(() => {
    const urlFilters = {
      location: searchParams.get('location') || 'all',
      duration: searchParams.get('duration') || 'all',
      length: searchParams.get('length') || 'all',
      budget: searchParams.get('budget') || 'all',
      passengers: searchParams.get('passengers') || 'all',
      amenities: 'all'
    };

    // Handle amenities array from URL
    const amenitiesFromUrl = searchParams.getAll('amenities');
    if (amenitiesFromUrl.length > 0) {
      urlFilters.amenities = amenitiesFromUrl;
    }

    setFilters(urlFilters);
  }, [searchParams]);

  // Filter logic - Improved with better matching
  const filteredYachts = useMemo(() => {
    return yachts.filter(yacht => {
      // Location filter - Improved matching
      if (filters.location !== 'all') {
        const yachtLocation = yacht.location?.city?.toLowerCase() || '';
        const yachtCountry = yacht.location?.country?.toLowerCase() || '';
        const filterLocation = filters.location.toLowerCase();

        const locationMatch = yachtLocation.includes(filterLocation) ||
          yachtCountry.includes(filterLocation) ||
          yachtLocation.replace(/\s+/g, '').includes(filterLocation.replace(/\s+/g, ''));

        if (!locationMatch) return false;
      }

      // Duration filter - Fixed logic
      if (filters.duration !== 'all') {
        const filterDuration = parseInt(filters.duration);
        const hasMatchingDuration = yacht.prices?.some(price =>
          price.charter_hours === filterDuration
        );
        if (!hasMatchingDuration) return false;
      }

      // Length filter - Fixed boundary cases
      if (filters.length !== 'all') {
        const yachtLength = yacht.length || 0;
        if (filters.length === '0-50' && yachtLength > 50) return false;
        if (filters.length === '50-90' && (yachtLength <= 50 || yachtLength > 90)) return false;
        if (filters.length === '90+' && yachtLength <= 90) return false;
      }

      // Budget filter - Improved logic
      if (filters.budget !== 'all') {
        const minPrice = yacht.prices?.[0]?.retail_cents / 100 || 0;
        if (filters.budget === '0-5000' && minPrice > 5000) return false;
        if (filters.budget === '5000-10000' && (minPrice <= 5000 || minPrice > 10000)) return false;
        if (filters.budget === '10000-15000' && (minPrice <= 10000 || minPrice > 15000)) return false;
      }

      // Amenities filter - Fixed logic
      if (filters.amenities !== 'all' && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
        // Skip if amenities is ['all'] or empty array
        if (filters.amenities.length === 1 && filters.amenities[0] === 'all') {
          // Do nothing, show all yachts
        } else {
          const yachtAmenities = yacht.amenities?.map(a => a.code) || [];
          const hasSelectedAmenities = filters.amenities.every(amenity =>
            yachtAmenities.includes(amenity)
          );
          if (!hasSelectedAmenities) return false;
        }
      }

      // Passengers filter - Improved logic
      if (filters.passengers !== 'all') {
        const maxPassengers = yacht.guests || 0;
        const filterPassengers = filters.passengers;

        if (filterPassengers === '10+') {
          if (maxPassengers < 10) return false;
        } else {
          const passengerNum = parseInt(filterPassengers);
          if (maxPassengers < passengerNum) return false;
        }
      }

      return true;
    });
  }, [filters]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentYachts = filteredYachts.slice(startIndex, endIndex);

  // Locations data for the section
  const displayedLocations = locationsData.slice(0, 6); // Pehli 6 locations
  const locationGridClasses = `grid ${LOCATIONS_GRID_CONFIG.base} ${LOCATIONS_GRID_CONFIG.md} ${LOCATIONS_GRID_CONFIG.lg} ${LOCATIONS_GRID_CONFIG.gap}`;

  // Dynamic count calculate karo locations ke liye
  const locationsWithCount = displayedLocations.map((location) => {
    const yachtsCount = yachts.filter(
      (yacht) => yacht.location?.city === location.title
    ).length;

    return {
      ...location,
      yachtsCount,
    };
  });

  const handlePageChange = (page) => {
    const currentScrollY = window.scrollY;
    setCurrentPage(page);

    requestAnimationFrame(() => {
      const yachtGridSection = yachtGridRef.current;
      if (yachtGridSection) {
        const sectionTop = yachtGridSection.offsetTop - 100;
        if (currentScrollY >= sectionTop) {
          window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
          });
        }
        else if (currentScrollY < 300) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
        else {
          window.scrollTo({
            top: currentScrollY,
            behavior: 'auto'
          });
        }
      }
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const showNoYachtsMessage = filteredYachts.length === 0;
  const showYachtGrid = !showNoYachtsMessage && currentYachts.length > 0;
  const showPagination = !showNoYachtsMessage && filteredYachts.length > itemsPerPage;

  // Show results count
  const resultsCount = filteredYachts.length;

  return (
    <main>
      <Banner
        mainHeading="Sail Beyond the Ordinary"
        description="Discover the freedom of the open sea with our bespoke yacht charters. Whether you seek adventure, relaxation, or unforgettable moments with loved ones, we craft every journey to match your vision. Step aboard and let the horizon become your destination."
        showContact={false}
        height="medium"
        backgroundImage="/images/charter_banner.png"
      />

      <section ref={yachtGridRef} className="lg:py-24 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[65px] font-light tracking-wide">
              Find Your Perfect Yacht
            </h1>
            <p className="text-base md:text-lg lg:text-xl sm:max-w-[95%] tracking-wider font-light">
              Browse through our curated fleet to discover the yacht that best suits your needs.
              Compare sizes, styles, and amenities, then select the vessel that aligns with your
              vision for the perfect charter experience.
            </p>
          </div>

          {/* Search Filter Component - initialFilters pass karo */}
          <SearchFilter
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            showClearAll={true}
          />

          {/* Results Count */}
          {!showNoYachtsMessage && (
            <div className="text-base md:text-lg lg:text-xl tracking-wider font-light">
              <span className="font-medium">{resultsCount}</span> Yachts Found 
            </div>
          )}

          <div className="border-t border-gray-300"></div>

          {showYachtGrid && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {currentYachts.map(yacht => (
                  <YachtCard key={yacht.id} yacht={yacht} />
                ))}
              </div>

              {showPagination && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredYachts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}

          {showNoYachtsMessage && (
            <div className="flex flex-col gap-5 items-center justify-center text-center py-12">
              <p className="text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-gray-600">
                No yachts found matching your criteria.
              </p>
              <p className="text-base md:text-lg lg:text-xl max-w-2xl tracking-wider font-light text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </section>

      <PerfectYachtBanner
        heading="Explore Luxury locations"
        text="Discover the finest yachts for your next adventure"
        buttonText="Explore Now"
        buttonLink="/location"
      />

      <section className="lg:py-24 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-5 sm:gap-4">
            <div className="flex flex-col gap-5 flex-1">
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[65px] font-light tracking-wide mb-4 lg:mb-6">
                {Exclusive_Locations.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl xl:max-w-5xl tracking-wider font-light text-gray-700">
                {Exclusive_Locations.description}
              </p>
            </div>

            <Link
              href={Exclusive_Locations.viewMore.link}
              className="group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 lg:self-center"
            >
              <span className="text-base md:text-lg lg:text-xl font-medium">
                {Exclusive_Locations.viewMore.text}
              </span>
              <GoArrowUpRight className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="border-t border-gray-300" aria-hidden="true" />

          {/* 6 Locations Grid */}
          <div className={locationGridClasses}>
            {locationsWithCount.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                yachtsCount={location.yachtsCount}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}