// app/charter/[slug]/page.js
"use client";
import { useState, useEffect } from "react";
import yachts from "../../../../data/yachts.json";
import Banner from "../../../components/Banner";
import ImageLightbox from "../../../components/ImageLightbox";
import LoadingSpinner from "../../../components/LoadingSpinner";
import YachtError from "../../../components/YachtError";
import Amenities from "@/app/components/Amenities";
import SpecificationsSection from "@/app/components/Specifications";
import PerfectYachtBanner from "@/app/components/PerfectYachtBanner";
import LocationMap from "@/app/components/LocationMap";
import FeaturesSection from "@/app/components/FeaturesSection";
import GallerySection from "@/app/components/GallerySection";

export default function YachtDetailPage({ params }) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slug, setSlug] = useState(null);
  const [yacht, setYacht] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { slug } = await params;
      setSlug(slug);
      const foundYacht = yachts.find((y) => y.slug === slug);
      setYacht(foundYacht);

      if (foundYacht) {
        const imagesArray = [
          foundYacht.image,
          ...(foundYacht.images?.map((img) => img.original_url) || []),
        ];
        setAllImages(imagesArray);
      }

      setLoading(false);
    };

    fetchData();
  }, [params]);

  const openLightbox = (index = 0) => {
    setCurrentImageIndex(index);
    setModalIsOpen(true);
  };

  const closeLightbox = () => setModalIsOpen(false);
  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );

  const displayImages = allImages.slice(0, 7);
  const remainingImages = Math.max(0, allImages.length - 7);
  const thumbnails = displayImages.slice(1, 7);

  if (loading) return <LoadingSpinner />;
  if (!yacht) return <YachtError slug={slug} />;

  // Charter data prepare karna yacht data se - JSON structure ke according
  const charterData = {
    charterLocation:
      yacht?.location?.city ||
      yacht?.location?.name ||
      "Location not specified",
    charterDurations: yacht?.prices?.map(
      (price) => `${price.charter_hours} ${price.charter_hours_label}`
    ) || ["4 hrs", "6 hrs"],
    maxPassengers: yacht?.guests || 6,
  };

  return (
    <div className="min-h-screen">
      <Banner
        mainHeading={yacht.title}
        showContact={true}
        height="medium"
        backgroundImage={yacht.banner_image}
        overlayOpacity={0.6}
      />

      {/* FeaturesSection with Booking Feature */}
      <FeaturesSection
        featuresInfo={yacht.features_and_availablity_info}
        prices={yacht.prices}
        brochure={yacht.brochure}
        charterLocation={charterData.charterLocation}
        charterDurations={charterData.charterDurations}
        maxPassengers={charterData.maxPassengers}
        title={yacht.title}
      />

      <GallerySection
        mainImage={yacht.image}
        thumbnails={thumbnails}
        remainingCount={remainingImages}
        onImageClick={openLightbox}
        title={yacht.title}
      />

      <Amenities amenities={yacht.amenities} />

      <SpecificationsSection specifications={yacht.specifications} />

      <PerfectYachtBanner />

      <LocationMap location={yacht.location} />

      <ImageLightbox
        isOpen={modalIsOpen}
        onClose={closeLightbox}
        images={allImages}
        currentIndex={currentImageIndex}
        onNext={nextImage}
        onPrev={prevImage}
        title={yacht.title}
      />
    </div>
  );
}
