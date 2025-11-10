import Link from "next/link";
import Banner from "../components/Banner";
import { GoArrowUpRight } from "react-icons/go";
import YachtCard from "../components/YachtCard";
import yachts from "../../data/yachts.json";
import PerfectYachtBanner from "../components/PerfectYachtBanner";
import LocationCard from "../components/LocationCard";
import locationsData from "../../data/locations.json";

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

const STATS_CONFIG = {
  destinations: {
    label: "Destinations",
    className: "flex items-center gap-2"
  },
  yachts: {
    label: "Luxury Yachts", 
    className: "flex items-center gap-2"
  },
  ports: {
    label: "Active Ports",
    className: "flex items-center gap-2"
  }
};

export default function Location() {
  const displayedYachts = yachts.slice(0, YACHT_DISPLAY_CONFIG.limit);
  const yachtGridClasses = `grid ${YACHT_DISPLAY_CONFIG.grid.base} ${YACHT_DISPLAY_CONFIG.grid.md} ${YACHT_DISPLAY_CONFIG.grid.lg} ${YACHT_DISPLAY_CONFIG.grid.xl} gap-8`;
  const locationGridClasses = `grid ${LOCATIONS_GRID_CONFIG.base} ${LOCATIONS_GRID_CONFIG.md} ${LOCATIONS_GRID_CONFIG.lg} ${LOCATIONS_GRID_CONFIG.gap}`;

  // Dynamic count calculate karo
  const locationsWithCount = locationsData.map(location => {
    const yachtsCount = yachts.filter(yacht => 
      yacht.location?.city === location.title
    ).length;
    
    return {
      ...location,
      yachtsCount
    };
  });

  const totalYachts = locationsWithCount.reduce((sum, location) => sum + location.yachtsCount, 0);
  const totalDestinations = locationsWithCount.length;
  const activePortsCount = locationsWithCount.filter(loc => loc.yachtsCount > 0).length;

  // Stats data const se
  const statsData = [
    { value: totalDestinations, ...STATS_CONFIG.destinations },
    { value: `${totalYachts}+`, ...STATS_CONFIG.yachts },
    { value: activePortsCount, ...STATS_CONFIG.ports }
  ];

  return (
    <>
      <Banner
        mainHeading="Explore the World’s Most Exquisite Waters"
        description="Get ready to embark on a voyage that will fascinate and excite you to the core. Whether you are drawn to the pulsating nightlife, the serenity of pure nature, or the privacy of an exclusive escape, HalaYachts unlocks the door to the world’s most enchanting waters."
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
              
              {/* Stats - Const se */}
              {/* <div className="flex flex-wrap gap-6 mt-4">
                {statsData.map((stat, index) => (
                  <div key={index} className={stat.className}>
                    <span className="text-2xl font-bold text-primary">{stat.value}</span>
                    <span className="text-gray-600">{stat.label}</span>
                  </div>
                ))}
              </div> */}
            </div>
          </div>

          {/* Location Cards Grid */}
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
            {displayedYachts.map((yacht) => (
              <YachtCard key={yacht.id} yacht={yacht} />
            ))}
          </div>

          {yachts.length === 0 && (
            <div className="text-center py-12" role="status" aria-live="polite">
              <p className="text-gray-500 text-lg">
                No yachts available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}