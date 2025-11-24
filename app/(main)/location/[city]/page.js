// // app/location/[city]/page.js
// "use client";

// import { notFound } from "next/navigation";
// import Banner from "../../../components/Banner";
// import YachtCard from "../../../components/YachtCard";
// import locationsData from "../../../../data/locations.json";
// import yachts from "../../../../data/yachts.json";
// import Link from "next/link";
// import SearchFilter from "../../../components/SearchFilter";
// import { useParams } from "next/navigation";
// import { useState, useMemo } from "react";

// // HTML Constants for consistent styling
// const PAGE_STYLES = {
//   section: "lg:py-24 py-8 bg-white",
//   container: "max-w-7xl mx-auto px-5",
//   content: "flex flex-col gap-10",
//   header: "flex flex-col gap-5",
//   title: "text-3xl md:text-5xl lg:text-6xl font-light tracking-wide",
//   description: "text-base md:text-lg lg:text-xl tracking-wider font-light",
//   divider: "border-t border-gray-300",
//   filterContainer: "mb-8",
//   grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
//   emptyState: "text-center py-16 rounded-2xl",
//   emptyStateContainer: "max-w-md mx-auto flex flex-col gap-3 justify-center items-center",
//   emptyStateIcon: "w-16 h-16 text-gray-400 mx-auto mb-4",
//   emptyStateTitle: "text-2xl tracking-wider font-light",
//   emptyStateText: "text-sm md:text-base lg:text-lg tracking-wider font-light",
//   emptyStateButton:
//     "text-lg tracking-wider font-light inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors",
// };

// // Filter logic constants
// const FILTER_LOGIC = {
//   duration: (yachtDuration, filterDuration) => yachtDuration >= filterDuration,
//   length: {
//     "0-50": (yachtLength) => yachtLength <= 50,
//     "50-90": (yachtLength) => yachtLength >= 50 && yachtLength <= 90,
//     "90+": (yachtLength) => yachtLength > 90,
//   },
//   budget: {
//     "0-5000": (yachtPrice) => yachtPrice <= 5000,
//     "5000-10000": (yachtPrice) => yachtPrice >= 5000 && yachtPrice <= 10000,
//     "10000-15000": (yachtPrice) => yachtPrice >= 10000 && yachtPrice <= 15000,
//   },
//   passengers: {
//     2: (yachtPassengers) => yachtPassengers >= 2,
//     4: (yachtPassengers) => yachtPassengers >= 4,
//     6: (yachtPassengers) => yachtPassengers >= 6,
//     8: (yachtPassengers) => yachtPassengers >= 8,
//     "10+": (yachtPassengers) => yachtPassengers >= 10,
//   },
// };

// export default function LocationDetail() {
//   const params = useParams();
//   const { city } = params;

//   const location = locationsData.find((loc) => loc.id === city);

//   if (!location) {
//     notFound();
//   }

//   // State for filters
//   const [filters, setFilters] = useState({
//     location: "current",
//     duration: "all",
//     length: "all",
//     budget: "all",
//     amenities: "all",
//     passengers: "all",
//   });

//   // Get all yachts for current location
//   const allLocationYachts = useMemo(
//     () =>
//       yachts.filter((yacht) => {
//         const yachtLocation = yacht.location?.city;
//         const currentLocation = location.title;

//         return (
//           yachtLocation === currentLocation ||
//           yachtLocation?.includes(location.title.split(",")[0]) ||
//           currentLocation.includes(yachtLocation?.split(",")[0])
//         );
//       }),
//     [location.title]
//   );

//   // Filter yachts based on selected filters
//   const filteredYachts = useMemo(() => {
//     return allLocationYachts.filter((yacht) => {
//       const yachtDuration = parseInt(yacht.duration) || 0;
//       const yachtLength = parseInt(yacht.length) || 0;
//       const yachtPrice = parseInt(yacht.price) || 0;
//       const yachtPassengers = parseInt(yacht.passengers) || 0;

//       // Duration filter
//       if (filters.duration !== "all") {
//         const filterDuration = parseInt(filters.duration);
//         if (!FILTER_LOGIC.duration(yachtDuration, filterDuration)) return false;
//       }

//       // Length filter
//       if (filters.length !== "all") {
//         const lengthFilter = FILTER_LOGIC.length[filters.length];
//         if (lengthFilter && !lengthFilter(yachtLength)) return false;
//       }

//       // Budget filter
//       if (filters.budget !== "all") {
//         const budgetFilter = FILTER_LOGIC.budget[filters.budget];
//         if (budgetFilter && !budgetFilter(yachtPrice)) return false;
//       }

//       // Passengers filter
//       if (filters.passengers !== "all") {
//         const passengerFilter = FILTER_LOGIC.passengers[filters.passengers];
//         if (passengerFilter && !passengerFilter(yachtPassengers)) return false;
//       }

//       // Amenities filter
//       if (
//         filters.amenities !== "all" &&
//         Array.isArray(filters.amenities) &&
//         filters.amenities.length > 0
//       ) {
//         const hasSelectedAmenities = filters.amenities.every((amenity) =>
//           yacht.amenities?.includes(amenity)
//         );
//         if (!hasSelectedAmenities) return false;
//       }

//       return true;
//     });
//   }, [allLocationYachts, filters]);

//   // Handle filter changes
//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//   };

//   // Get location name without country 
//   const locationName = location.title.split(",")[0];

//   return (
//     <>
//       <Banner
//         smallHeading={`Explore ${location.title} Unmatched Luxury`}
//         mainHeading={`Yacht Charter in ${locationName}`}
//         description="Whether you seek vibrant nightlife, pristine nature, or quiet exclusivity, our destinations span continents and cultures. Glide along the French Riviera, explore the ancient coastlines of Greece,. Every journey reveals a new perspective on luxury travel."
//         showContact={true}
//         height="medium"
//         backgroundImage={location.image}
//         overlayOpacity={0.6}
//       />

//       <section className={PAGE_STYLES.section}>
//         <div className={PAGE_STYLES.container}>
//           <div className={PAGE_STYLES.content}>
//             {/* Header Section */}
//             <div className={PAGE_STYLES.header}>
//               <h1 className={PAGE_STYLES.title}>
//                 Find Perfect Yachts in {locationName}
//               </h1>

//               <p className={PAGE_STYLES.description}>
//                 <span className="font-semibold text-primary">
//                   {filteredYachts.length}
//                 </span>{" "}
//                 {filteredYachts.length === 1 ? "yacht is" : "yachts are"}{" "}
//                 available for charter in {location.title}. Use the filters below
//                 to explore available yachts departing from {locationName}.
//                 Choose your preferred vessel size, amenities, and duration — and
//                 our team will ensure every detail matches your expectations.
//               </p>
//             </div>

//             <div className={PAGE_STYLES.divider} />

//             {/* Search Filter Component */}
//             <div className={PAGE_STYLES.filterContainer}>
//               <SearchFilter
//                 onFilterChange={handleFilterChange}
//                 showClearAll={true}
//                 initialFilters={filters}
//                 showMobileFilters={false}
//                 isLocationPage={true}
//                 currentLocation={location.title}
//               />
//             </div>

//             {/* Yachts Grid */}
//             {filteredYachts.length > 0 ? (
//               <div className={PAGE_STYLES.grid}>
//                 {filteredYachts.map((yacht) => (
//                   <YachtCard key={yacht.id} yacht={yacht} />
//                 ))}
//               </div>
//             ) : (
//               <EmptyState
//                 location={location.title}
//                 locationName={locationName}
//               />
//             )}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// // Empty State Component
// const EmptyState = ({ location, locationName }) => (
//   <div className={PAGE_STYLES.emptyState}>
//     <div className={PAGE_STYLES.emptyStateContainer}>
//       <EmptyStateIcon />
//       <h3 className={PAGE_STYLES.emptyStateTitle}>
//         No Yachts Match Your Filters
//       </h3>
//       <p className={PAGE_STYLES.emptyStateText}>
//         There are no yachts available in {location} that match your current
//         filters. Try adjusting your criteria.
//       </p>
//       <Link href="/location" className={PAGE_STYLES.emptyStateButton}>
//         Browse All Locations
//       </Link>
//     </div>
//   </div>
// );

// const EmptyStateIcon = () => (
//   <svg
//     className={PAGE_STYLES.emptyStateIcon}
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={1}
//       d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//     />
//   </svg>
// );
// app/location/[city]/page.js
"use client";

import { notFound } from "next/navigation";
import Banner from "../../../components/Banner";
import YachtCard from "../../../components/YachtCard";
import Link from "next/link";
import SearchFilter from "../../../components/SearchFilter";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

// HTML Constants for consistent styling
const PAGE_STYLES = {
  section: "lg:py-24 py-8 bg-white",
  container: "max-w-7xl mx-auto px-5",
  content: "flex flex-col gap-10",
  header: "flex flex-col gap-5",
  title: "text-3xl md:text-5xl lg:text-6xl font-light tracking-wide",
  description: "text-base md:text-lg lg:text-xl tracking-wider font-light",
  divider: "border-t border-gray-300",
  filterContainer: "mb-8",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
  emptyState: "text-center py-16 rounded-2xl",
  emptyStateContainer: "max-w-md mx-auto flex flex-col gap-3 justify-center items-center",
  emptyStateIcon: "w-16 h-16 text-gray-400 mx-auto mb-4",
  emptyStateTitle: "text-2xl tracking-wider font-light",
  emptyStateText: "text-sm md:text-base lg:text-lg tracking-wider font-light",
  emptyStateButton:
    "text-lg tracking-wider font-light inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors",
};

// Filter logic constants
const FILTER_LOGIC = {
  duration: (yachtDuration, filterDuration) => yachtDuration >= filterDuration,
  length: {
    "0-50": (yachtLength) => yachtLength <= 50,
    "50-90": (yachtLength) => yachtLength >= 50 && yachtLength <= 90,
    "90+": (yachtLength) => yachtLength > 90,
  },
  budget: {
    "0-5000": (yachtPrice) => yachtPrice <= 5000,
    "5000-10000": (yachtPrice) => yachtPrice >= 5000 && yachtPrice <= 10000,
    "10000-15000": (yachtPrice) => yachtPrice >= 10000 && yachtPrice <= 15000,
  },
  passengers: {
    2: (yachtPassengers) => yachtPassengers >= 2,
    4: (yachtPassengers) => yachtPassengers >= 4,
    6: (yachtPassengers) => yachtPassengers >= 6,
    8: (yachtPassengers) => yachtPassengers >= 8,
    "10+": (yachtPassengers) => yachtPassengers >= 10,
  },
};

// Server component that fetches yachts from database
async function getYachts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/yachts`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch yachts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching yachts:', error);
    return [];
  }
}

// Server component that fetches locations from database
async function getLocations() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/locations`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

// Empty State Component (outside main component)
const EmptyStateIcon = () => (
  <svg
    className="w-16 h-16 text-gray-400 mx-auto mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const EmptyState = ({ location, locationName }) => (
  <div className="text-center py-16 rounded-2xl">
    <div className="max-w-md mx-auto flex flex-col gap-3 justify-center items-center">
      <EmptyStateIcon />
      <h3 className="text-2xl tracking-wider font-light">
        No Yachts Match Your Filters
      </h3>
      <p className="text-sm md:text-base lg:text-lg tracking-wider font-light">
        There are no yachts available in {location} that match your current
        filters. Try adjusting your criteria.
      </p>
      <Link 
        href="/location" 
        className="text-lg tracking-wider font-light inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Browse All Locations
      </Link>
    </div>
  </div>
);

export default function LocationDetail() {
  const params = useParams();
  const { city } = params;
  
  const [locationsData, setLocationsData] = useState([]);
  const [yachtsData, setYachtsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "current",
    duration: "all",
    length: "all",
    budget: "all",
    amenities: "all",
    passengers: "all",
  });

  // Fetch locations and yachts from database
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        console.log('Fetching data for location:', city);
        
        // Parallel fetch for better performance
        const [locationsResponse, yachtsResponse] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/yachts')
        ]);

        if (isMounted) {
          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            setLocationsData(locationsData);
          }

          if (yachtsResponse.ok) {
            const yachtsData = await yachtsResponse.json();
            setYachtsData(yachtsData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [city]);

  // Find current location
  const location = locationsData.find((loc) => loc.id === city);

  // Get all yachts for current location
  const allLocationYachts = useMemo(
    () => {
      if (!location) return [];
      
      return yachtsData.filter((yacht) => {
        const yachtLocation = yacht.location?.city;
        const currentLocation = location.title;

        return (
          yachtLocation === currentLocation ||
          yachtLocation?.includes(location.title.split(",")[0]) ||
          currentLocation.includes(yachtLocation?.split(",")[0])
        );
      });
    },
    [location, yachtsData]
  );

  // Filter yachts based on selected filters
  const filteredYachts = useMemo(() => {
    if (!location) return [];
    
    return allLocationYachts.filter((yacht) => {
      // Duration filter
      if (filters.duration !== "all") {
        const filterDuration = parseInt(filters.duration);
        const hasMatchingDuration = yacht.prices?.some(price =>
          price.charter_hours === filterDuration
        );
        if (!hasMatchingDuration) return false;
      }

      // Length filter
      if (filters.length !== "all") {
        const yachtLength = yacht.length || 0;
        if (filters.length === '0-50' && yachtLength > 50) return false;
        if (filters.length === '50-90' && (yachtLength <= 50 || yachtLength > 90)) return false;
        if (filters.length === '90+' && yachtLength <= 90) return false;
      }

      // Budget filter
      if (filters.budget !== "all") {
        const minPrice = yacht.prices?.[0]?.retail_cents / 100 || 0;
        if (filters.budget === '0-5000' && minPrice > 5000) return false;
        if (filters.budget === '5000-10000' && (minPrice <= 5000 || minPrice > 10000)) return false;
        if (filters.budget === '10000-15000' && (minPrice <= 10000 || minPrice > 15000)) return false;
      }

      // Passengers filter
      if (filters.passengers !== "all") {
        const maxPassengers = yacht.guests || 0;
        const filterPassengers = filters.passengers;

        if (filterPassengers === '10+') {
          if (maxPassengers < 10) return false;
        } else {
          const passengerNum = parseInt(filterPassengers);
          if (maxPassengers < passengerNum) return false;
        }
      }

      // Amenities filter
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

      return true;
    });
  }, [allLocationYachts, filters, location]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading location...</p>
        </div>
      </div>
    );
  }

  // Show not found if location doesn't exist
  if (!location) {
    notFound();
  }

  // Get location name without country
  const locationName = location.title.split(",")[0];

  return (
    <>
      <Banner
        smallHeading={`Explore ${location.title} Unmatched Luxury`}
        mainHeading={`Yacht Charter in ${locationName}`}
        description="Whether you seek vibrant nightlife, pristine nature, or quiet exclusivity, our destinations span continents and cultures. Glide along the French Riviera, explore the ancient coastlines of Greece,. Every journey reveals a new perspective on luxury travel."
        showContact={true}
        height="medium"
        backgroundImage={location.image}
        overlayOpacity={0.6}
      />

      <section className="lg:py-24 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col gap-10">
            {/* Header Section */}
            <div className="flex flex-col gap-5">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-wide">
                Find Perfect Yachts in {locationName}
              </h1>

              <p className="text-base md:text-lg lg:text-xl tracking-wider font-light">
                <span className="font-semibold text-primary">
                  {filteredYachts.length}
                </span>{" "}
                {filteredYachts.length === 1 ? "yacht is" : "yachts are"}{" "}
                available for charter in {location.title}. Use the filters below
                to explore available yachts departing from {locationName}.
                Choose your preferred vessel size, amenities, and duration — and
                our team will ensure every detail matches your expectations.
              </p>
            </div>

            <div className="border-t border-gray-300" />

            {/* Search Filter Component */}
            <div className="mb-8">
              <SearchFilter
                onFilterChange={handleFilterChange}
                showClearAll={true}
                initialFilters={filters}
                showMobileFilters={false}
                isLocationPage={true}
                currentLocation={location.title}
              />
            </div>

            {/* Yachts Grid */}
            {filteredYachts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredYachts.map((yacht) => (
                  <YachtCard key={yacht.id} yacht={yacht} />
                ))}
              </div>
            ) : (
              <EmptyState
                location={location.title}
                locationName={locationName}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}