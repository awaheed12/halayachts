import { Suspense } from 'react';
import Banner from "../components/Banner";
import Community from "../components/community";
import WhyHalaYachts from "../components/WhyHalaYachts";
import YachtCard from "../components/YachtCard";
import { GoArrowUpRight } from "react-icons/go";
import Link from "next/link";
import SearchHomeSection from "../components/SearchHomeSection";
import LocationCard from "../components/LocationCard";

// Loading component for suspense
function SearchSectionLoader() {
  return (
    <div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
  );
}

// Loading component for yachts
function YachtsLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}

// Loading component for locations
function LocationsLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}

const YACHT_DISPLAY_CONFIG = {
  limit: 6,
  grid: {
    base: "grid-cols-1",
    md: "md:grid-cols-2",
    lg: "lg:grid-cols-2",
    xl: "xl:grid-cols-3",
  },
};

const LOCATIONS_GRID_CONFIG = {
  base: "grid-cols-1",
  md: "md:grid-cols-2",
  lg: "lg:grid-cols-3",
  gap: "gap-8",
};

const HERO_CONTENT = {
  smallHeading: "Hala Yachts: Redefining Luxury on Water",
  mainHeading: "Exclusive Yacht Voyages",
  description:
    "At Hala Yachts, we are driven to provide you with the best of luxury travel in yachting. Whether you seek a serene coastal escape or an extended voyage across the world's most coveted waters, we craft experiences as limitless and refined as the sea itself.",
  cta: {
    showButton: true,
    buttonText: "Book Now",
    buttonLink: "/charter",
  },
  showContact: true,
};

const FLEET_SECTION = {
  title: "Find Your Perfect Yacht",
  description:
    "Browse through our curated fleet to discover the yacht that best suits your needs. Compare sizes, styles, and amenities, then select the vessel that aligns with your vision for the perfect charter experience.",
  viewMore: {
    text: "View more",
    link: "/charter",
  },
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

// Server component that fetches yachts from database
async function getYachts(limit = null) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/yachts`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch yachts');
    }
    
    const allYachts = await response.json();
    return typeof limit === "number" ? allYachts.slice(0, limit) : allYachts;
  } catch (error) {
    console.error('Error fetching yachts:', error);
    return [];
  }
}

// Server component that fetches locations from database
async function getLocations(limit = 6) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/locations`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    
    const allLocations = await response.json();
    return allLocations.slice(0, limit);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

// Yachts Section as a separate component for Suspense
async function YachtsSection() {
  const yachtsData = await getYachts(6);
  
  const yachtGridClasses = `grid ${YACHT_DISPLAY_CONFIG.grid.base} ${YACHT_DISPLAY_CONFIG.grid.md} ${YACHT_DISPLAY_CONFIG.grid.lg} ${YACHT_DISPLAY_CONFIG.grid.xl} gap-8`;

  return (
    <section className="lg:py-24 py-8 bg-white">
      <div className="max-w-7xl mx-auto px-5 flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-5 sm:gap-4">
          <div className="flex flex-col gap-5 flex-1">
            <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[65px] font-light tracking-wide mb-4 lg:mb-6">
              {FLEET_SECTION.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl xl:max-w-5xl tracking-wider font-light text-gray-700">
              {FLEET_SECTION.description}
            </p>
          </div>

          <Link
            href={FLEET_SECTION.viewMore.link}
            className="group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 lg:self-center"
          >
            <span className="text-base md:text-lg lg:text-xl font-medium">
              {FLEET_SECTION.viewMore.text}
            </span>
            <GoArrowUpRight className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="border-t border-gray-300" aria-hidden="true" />

        <div className={yachtGridClasses}>
          {yachtsData.length > 0 ? (
            yachtsData.map((yacht) => (
              <YachtCard key={yacht.id} yacht={yacht} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No yachts available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Locations Section as a separate component for Suspense
async function LocationsSection() {
  const locationsData = await getLocations(6);
  const yachtsData = await getYachts(); // Fetch all yachts for accurate counts
  
  const locationGridClasses = `grid ${LOCATIONS_GRID_CONFIG.base} ${LOCATIONS_GRID_CONFIG.md} ${LOCATIONS_GRID_CONFIG.lg} ${LOCATIONS_GRID_CONFIG.gap}`;

  // Dynamic count calculate karo locations ke liye
  const locationsWithCount = locationsData.map((location) => {
    const yachtsCount = yachtsData.filter(
      (yacht) => yacht.location?.city === location.title
    ).length;

    return {
      ...location,
      yachtsCount,
    };
  });

  return (
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
          {locationsWithCount.length > 0 ? (
            locationsWithCount.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                yachtsCount={location.yachtsCount}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No locations available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Banner
        smallHeading={HERO_CONTENT.smallHeading}
        mainHeading={HERO_CONTENT.mainHeading}
        description={HERO_CONTENT.description}
        showButton={HERO_CONTENT.cta.showButton}
        buttonText={HERO_CONTENT.cta.buttonText}
        buttonLink={HERO_CONTENT.cta.buttonLink}
        showContact={HERO_CONTENT.showContact}
      />
      
      {/* SearchHomeSection ko suspense mein wrap karo */}
      <Suspense fallback={<SearchSectionLoader />}>
        <SearchHomeSection />
      </Suspense>

      <WhyHalaYachts />

      {/* Yachts Section with Suspense */}
      <Suspense fallback={
        <section className="lg:py-24 py-8 bg-white">
          <div className="max-w-7xl mx-auto px-5 flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-5 sm:gap-4">
              <div className="flex flex-col gap-5 flex-1">
                <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[65px] font-light tracking-wide mb-4 lg:mb-6">
                  {FLEET_SECTION.title}
                </h1>
                <p className="text-base md:text-lg lg:text-xl xl:max-w-5xl tracking-wider font-light text-gray-700">
                  {FLEET_SECTION.description}
                </p>
              </div>
              <div className="lg:self-center">
                <div className="group flex items-center gap-2 text-primary">
                  <span className="text-base md:text-lg lg:text-xl font-medium">
                    {FLEET_SECTION.viewMore.text}
                  </span>
                  <GoArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300" aria-hidden="true" />
            <YachtsLoader />
          </div>
        </section>
      }>
        <YachtsSection />
      </Suspense>

      {/* Locations Section with Suspense */}
      <Suspense fallback={
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
              <div className="lg:self-center">
                <div className="group flex items-center gap-2 text-primary">
                  <span className="text-base md:text-lg lg:text-xl font-medium">
                    {Exclusive_Locations.viewMore.text}
                  </span>
                  <GoArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300" aria-hidden="true" />
            <LocationsLoader />
          </div>
        </section>
      }>
        <LocationsSection />
      </Suspense>

      <Community />
    </main>
  );
}