// app/location/[city]/page.js
import { notFound } from "next/navigation";
import Banner from "../../components/Banner";
import YachtCard from "../../components/YachtCard";
import locationsData from "../../../data/locations.json";
import yachts from "../../../data/yachts.json";
import Link from "next/link"; // <- YEH IMPORT ADD KARO

export async function generateStaticParams() {
  return locationsData.map((location) => ({
    city: location.id,
  }));
}

export default async function LocationDetail({ params }) {
  const { city } = await params;

  const location = locationsData.find((loc) => loc.id === city);

  if (!location) {
    notFound();
  }

  const locationYachts = yachts.filter((yacht) => {
    const yachtLocation = yacht.location?.city;
    const currentLocation = location.title;

    return (
      yachtLocation === currentLocation ||
      yachtLocation?.includes(location.title.split(",")[0]) ||
      currentLocation.includes(yachtLocation?.split(",")[0])
    );
  });

  return (
    <>
      <Banner
        smallHeading={`Explore ${location.title} Unmatched Luxury`}
        mainHeading={`Yacht Charter in ${location.title.split(",")[0]}`}
        description="Whether you seek vibrant nightlife, pristine nature, or quiet exclusivity, our destinations span continents and cultures. Glide along the French Riviera, explore the ancient coastlines of Greece,. Every journey reveals a new perspective on luxury travel."
        showContact={true}
        height="medium"
        backgroundImage={location.image}
        overlayOpacity={0.6}
      />

      <section className="lg:py-24 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-wide">
                Find Perfect Yachts in {location.title.split(",")[0]}
              </h1>

              <p className="text-base md:text-lg lg:text-xl tracking-wider font-light">
                <span className="font-semibold text-primary">
                  {locationYachts.length}
                </span>{" "}
                {locationYachts.length === 1 ? 'yacht is' : 'yachts are'} available for charter in {location.title}. Use the filters below to explore available yachts departing from {location.title.split(",")[0]}. Choose your preferred vessel size, amenities, and duration — and our team will ensure every detail matches your expectations.
              </p>
            </div>

            <div className="border-t border-gray-300"></div>

            {locationYachts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {locationYachts.map((yacht) => (
                  <YachtCard key={yacht.id} yacht={yacht} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl">
                <div className="max-w-md mx-auto">
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
                  <h3 className="text-2xl font-light text-gray-600 mb-2">
                    No Yachts Available
                  </h3>
                  <p className="text-gray-500 mb-6">
                    There are currently no yachts available in {location.title}.
                  </p>
                  {/* YEH LINE CHANGE KARO - <a> se <Link> mein */}
                  <Link
                    href="/location"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Browse All Locations
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}