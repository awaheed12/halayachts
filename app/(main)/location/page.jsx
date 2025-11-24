import Link from "next/link";
import Banner from "../../components/Banner";
import { GoArrowUpRight } from "react-icons/go";
import YachtCard from "../../components/YachtCard";
import PerfectYachtBanner from "../../components/PerfectYachtBanner";
import LocationCard from "../../components/LocationCard";

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
  gap: "gap-8"
};

const Curated_Global_Ports = {
  title: "Curated Global Ports",
  description:
    "Every port in our network has been selected for its charm, accessibility, and experience. Each marina offers world-class facilities and a gateway to adventure."
};

const FLEET_SECTION = {
  title: "Featured Yachts",
  description:
    "Discover the art of yachting with our featured collection, where luxury meets precision. From modern superyachts to timeless classics, every vessel reflects excellence and effortless sophistication.",
  viewMore: {
    text: "View more",
    link: "/charter",
  },
};

const Design_Routes = {
  title: "Design Your Own Route",
  description:
    "Your journey doesn't have to follow a map, it follows your imagination. Combine multiple destinations, request a bespoke route, or allow our team to curate the perfect itinerary, from coastal Europe to the Caribbean and beyond.",
  viewMore: {
    text: "About Us",
    link: "/about",
  },
};

import { getApiUrl } from '@/lib/utils';

// Server component that fetches yachts from database
async function getYachts(limit = null) {
  try {
    const apiUrl = getApiUrl('/api/yachts');
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch yachts: ${response.status}`);
    }

    const allYachts = await response.json();
    return typeof limit === "number" ? allYachts.slice(0, limit) : allYachts;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching yachts:', error);
    }
    return [];
  }
}

// Server component that fetches locations from database
async function getLocations() {
  try {
    const apiUrl = getApiUrl('/api/locations');
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching locations:', error);
    }
    return [];
  }
}

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

export default async function Location() {
  // Fetch both yachts and locations from database
  const [yachtsData, locationsData] = await Promise.all([
    getYachts(),
    getLocations()
  ]);

  const displayedYachts = yachtsData.slice(0, YACHT_DISPLAY_CONFIG.limit);
  const yachtGridClasses = `grid ${YACHT_DISPLAY_CONFIG.grid.base} ${YACHT_DISPLAY_CONFIG.grid.md} ${YACHT_DISPLAY_CONFIG.grid.lg} ${YACHT_DISPLAY_CONFIG.grid.xl} gap-8`;
  const locationGridClasses = `grid ${LOCATIONS_GRID_CONFIG.base} ${LOCATIONS_GRID_CONFIG.md} ${LOCATIONS_GRID_CONFIG.lg} ${LOCATIONS_GRID_CONFIG.gap}`;

  // Dynamic count calculate karo - database se aaye yachts data ke according
  const locationsWithCount = locationsData.map((location) => {
    const yachtsCount = yachtsData.filter(yacht =>
      yacht.location?.city === location.title
    ).length;

    return {
      ...location,
      yachtsCount
    };
  });

  return (
    <>
      <Banner
        mainHeading="Explore the World's Most Exquisite Waters"
        description="Get ready to embark on a voyage that will fascinate and excite you to the core. Whether you are drawn to the pulsating nightlife, the serenity of pure nature, or the privacy of an exclusive escape, HalaYachts unlocks the door to the world's most enchanting waters."
        showContact={false}
        height="medium"
        backgroundImage="/images/location.png"
      />

      {/* Curated Global Ports Section with Location Cards */}
      <section className="lg:py-24 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-5 flex flex-col gap-12">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-5 sm:gap-4">
            <div className="flex flex-col gap-5 flex-1">
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[65px] font-light tracking-wide mb-4 lg:mb-6">
                {Curated_Global_Ports.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl tracking-wider font-light text-gray-700 max-w-4xl">
                {Curated_Global_Ports.description}
              </p>
            </div>
          </div>

          {/* Location Cards Grid */}
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
                <p className="text-gray-500 text-lg tracking-wider">
                  No locations available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Design Your Own Route Section */}
      <section className="lg:py-24 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-5 sm:gap-4">
            <div className="flex flex-col gap-5 flex-1">
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[65px] font-light tracking-wide mb-4 lg:mb-6">
                {Design_Routes.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl xl:max-w-5xl tracking-wider font-light text-gray-700">
                {Design_Routes.description}
              </p>
            </div>

            <Link
              href={Design_Routes.viewMore.link}
              className="group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 lg:self-center"
            >
              <span className="text-base md:text-lg lg:text-xl font-medium">
                {Design_Routes.viewMore.text}
              </span>
              <GoArrowUpRight className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <PerfectYachtBanner />

      {/* Featured Yachts Section */}
      <section className="lg:py-24 py-8">
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
            {displayedYachts.length > 0 ? (
              displayedYachts.map((yacht) => (
                <YachtCard key={yacht.id} yacht={yacht} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg tracking-wider">
                  No yachts available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}