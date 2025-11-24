// components/FeaturesSection.js
'use client';

import { useState, useEffect } from 'react';
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';
import BookingForm from './BookingForm';

const CONTENT = {
  heading: {
    prefix: "Explore",
    suffix: "Features and Availability"
  },
  pricingNote: "Charter Prices:Price Boxes For All-In Costs.",
  note: "All particulars are given in good faith, however exact accuracy is not guaranteed.",
  shareButton: "Share",
  downloadBrochure: "Download Brochure",
  downloading: "Downloading...",
  bookNow: "Book Now",
  brokerSection: {
    call: "Call",
    email: "Email",
    description: "Your dedicated yacht broker"
  }
};

const STYLES = {
  section: "lg:py-24 py-8 bg-white",
  container: "max-w-7xl mx-auto px-5",
  content: "flex flex-col gap-5",
  heading: "text-3xl md:text-6xl lg:text-6xl xl:text-[65px] font-light tracking-wide",
  secondaryText: "text-secondary",
  description: "text-base md:text-lg lg:text-xl tracking-wider font-light",
  divider: "border-t border-gray-300",
  pricingNote: "text-base tracking-wider font-light",
  pricingSection: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  pricingGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  priceBox: "bg-text-secondary border border-gray-300 rounded-lg lg:p-6 p-3 hover:shadow-md transition-shadow cursor-pointer",
  priceContent: "flex flex-col items-center gap-1",
  priceAmount: "text-3xl font-bold text-white tracking-wider",
  rateInfo: "flex items-center gap-1 text-white text-lg tracking-wider",
  duration: "text-white text-lg",
  noteSection: "flex flex-col lg:items-end gap-4",
  noteText: "text-base tracking-wider font-light",
  noteLabel: "font-semibold block mb-1",
  shareButton: "text-base p-3 lg:w-2xs w-full md:text-base font-light tracking-wider rounded border cursor-pointer hover:bg-opacity-90 transition duration-300 text-black",
  downloadButton: "text-base p-3 lg:w-2xs w-full md:text-base font-light tracking-wider rounded border cursor-pointer hover:bg-opacity-90 transition duration-300 text-black flex items-center justify-center gap-2",
  downloadButtonDisabled: "text-base p-3 lg:w-2xs w-full md:text-base font-light tracking-wider rounded border cursor-not-allowed opacity-70 text-black flex items-center justify-center gap-2",
  shareDropdown: "absolute bottom-full left-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3",
  shareGrid: "grid grid-cols-3 gap-2",
  shareOption: "flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer",
  shareLabel: "text-xs text-gray-600 mt-1",
  copyNotification: "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300",
  bookButton: "bg-text-primary text-white text-base p-3 lg:w-2xs w-full md:text-base font-light tracking-wider rounded cursor-pointer hover:bg-opacity-90 transition duration-300",
  brokerSection: "flex flex-col gap-5",
  brokerContent: "flex flex-row gap-6 items-center",
  brokerInfo: "flex-1 flex flex-col gap-1",
  brokerImageContainer: "w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 md:mb-0",
  brokerImage: "w-full h-full object-cover",
  brokerName: "text-xl font-light tracking-wide",
  brokerDescription: "text-base  tracking-wider font-light",
  brokerActions: "flex flex-col sm:flex-row gap-3",
  brokerButton: "flex items-center justify-center gap-2 px-5 py-2 rounded text-white font-medium transition-colors",
  callButton: "bg-text-primary text-white text-base md:text-base font-light tracking-wider rounded cursor-pointer hover:bg-opacity-90 transition duration-300",
  emailButton: "bg-text-primary text-white text-base md:text-base font-light tracking-wider rounded cursor-pointer hover:bg-opacity-90 transition duration-300"
};

const formatPrice = (cents, currency) => {
  const amount = cents / 100;
  return `${currency}${amount.toLocaleString()}`;
};

export default function FeaturesSection({
  featuresInfo = "",
  prices = [],
  brochure = null,
  headingPrefix = CONTENT.heading.prefix,
  headingSuffix = CONTENT.heading.suffix,
  pricingNote = CONTENT.pricingNote,
  note = CONTENT.note,
  shareButton = CONTENT.shareButton,
  downloadBrochure = CONTENT.downloadBrochure,
  downloading = CONTENT.downloading,
  bookNow = CONTENT.bookNow,
  charterLocation = "",
  charterDurations = [],
  maxPassengers = 10,
  title = "",
  broker = null // New broker prop
}) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const hasPrices = prices?.length > 0;
  const hasBrochure = brochure && brochure.file_path;
  const hasBroker = broker && broker.broker_name;
  const hasBrokerImage = broker?.broker_image && broker.broker_image.trim();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = "Check out this amazing charter!";

  const shareOptions = [
    {
      name: 'WhatsApp',
      component: WhatsappShareButton,
      icon: WhatsappIcon,
      props: {
        url: shareUrl,
        title: shareTitle,
        separator: " :: ",
      }
    },
    {
      name: 'Email',
      component: EmailShareButton,
      icon: EmailIcon,
      props: {
        url: shareUrl,
        subject: shareTitle,
        body: `Check out this amazing charter: ${shareUrl}`,
      }
    },
    {
      name: 'Facebook',
      component: FacebookShareButton,
      icon: FacebookIcon,
      props: {
        url: shareUrl,
        quote: shareTitle,
      }
    },
    {
      name: 'Twitter',
      component: TwitterShareButton,
      icon: TwitterIcon,
      props: {
        url: shareUrl,
        title: shareTitle,
      }
    },
    {
      name: 'LinkedIn',
      component: LinkedinShareButton,
      icon: LinkedinIcon,
      props: {
        url: shareUrl,
        title: shareTitle,
      }
    },
    {
      name: 'Telegram',
      component: TelegramShareButton,
      icon: TelegramIcon,
      props: {
        url: shareUrl,
        title: shareTitle,
      }
    },
  ];

  // Debug: Check for duplicate price IDs
  useEffect(() => {
    if (prices && prices.length > 0) {
      const priceIds = prices.map(p => p.id);
      const uniqueIds = new Set(priceIds);
      if (uniqueIds.size !== priceIds.length) {
        console.warn('Duplicate price IDs found:', priceIds);
      }
    }
  }, [prices]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopyNotification(true);
    setShowShareOptions(false);
    setTimeout(() => setShowCopyNotification(false), 3000);
  };

  const handleDownloadBrochure = async () => {
    if (hasBrochure && !isDownloading) {
      setIsDownloading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const link = document.createElement('a');
        link.href = brochure.file_path;
        link.download = brochure.file_name || 'brochure.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => setIsDownloading(false), 500);
      } catch (error) {
        console.error('Download failed:', error);
        setIsDownloading(false);
      }
    }
  };

  const handleCallBroker = () => {
    if (broker?.broker_phone_number) {
      window.open(`tel:${broker.broker_phone_number}`, '_self');
    }
  };

  const handleEmailBroker = () => {
    if (broker?.broker_email) {
      window.open(`mailto:${broker.broker_email}?subject=Inquiry about ${title}`, '_self');
    }
  };

  const bookingData = {
    location: charterLocation,
    durations: charterDurations,
    maxPassengers: maxPassengers,
    yachtTitle: title
  };

  return (
    <section className={STYLES.section}>
      <div className={STYLES.container}>
        <div className={STYLES.content}>
          <h2 className={STYLES.heading}>
            <span className={STYLES.secondaryText}>{headingPrefix}</span> {headingSuffix}
          </h2>

          <p className={STYLES.description}>
            {featuresInfo}
          </p>

          <div className={STYLES.divider} />

          {/* Broker Section - Moved above pricing note */}
          {hasBroker && (
            <div className={STYLES.brokerSection}>
              <div className={STYLES.brokerContent}>
                {/* Broker Image - Only show if image exists */}
                {hasBrokerImage && (
                  <div className={STYLES.brokerImageContainer}>
                    <img 
                      src={broker.broker_image} 
                      alt={broker.broker_name}
                      className={STYLES.brokerImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Broker Info */}
                <div className={STYLES.brokerInfo}>
                  <h4 className={STYLES.brokerName}>{broker.broker_name}</h4>
                  <p className={STYLES.brokerDescription}>
                    {broker.broker_description || CONTENT.brokerSection.description}
                  </p>
                  
                  {/* Broker Contact Actions */}
                  <div className={STYLES.brokerActions}>
                    {broker.broker_phone_number && (
                      <button
                        onClick={handleCallBroker}
                        className={`${STYLES.brokerButton} ${STYLES.callButton}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {CONTENT.brokerSection.call}
                      </button>
                    )}
                    
                    {broker.broker_email && (
                      <button
                        onClick={handleEmailBroker}
                        className={`${STYLES.brokerButton} ${STYLES.emailButton}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {CONTENT.brokerSection.email}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <span className={STYLES.pricingNote}>
            {pricingNote}
          </span>

          {hasPrices && (
            <div className={STYLES.pricingSection}>
              <div className="flex flex-col gap-6">
                <div className={STYLES.pricingGrid}>
                  {prices.map((price, index) => (
                    <div 
                      key={`price-${price.id}-${price.retail_cents}-${index}`} 
                      className={STYLES.priceBox}
                    >
                      <div className={STYLES.priceContent}>
                        <div className={STYLES.priceAmount}>
                          {formatPrice(price.retail_cents, price.retail_currency)}
                        </div>
                        <div className={STYLES.rateInfo}>
                          <span>{price.half_day || price.full_day}:</span>
                          <span className={STYLES.duration}>
                            ({price.charter_hours} {price.charter_hours_label})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={STYLES.noteText}>
                  <span className={STYLES.noteLabel}>Note:</span>
                  {note}
                </div>
              </div>

              <div className={STYLES.noteSection}>
                <div className="relative w-full lg:w-2xs">
                  <button
                    className={STYLES.shareButton}
                    onClick={() => setShowShareOptions(!showShareOptions)}
                  >
                    {shareButton}
                  </button>

                  {showShareOptions && (
                    <div className={STYLES.shareDropdown}>
                      <div className={STYLES.shareGrid}>
                        <div
                          className={STYLES.shareOption}
                          onClick={handleCopyLink}
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className={STYLES.shareLabel}>Copy Link</span>
                        </div>

                        {shareOptions.map((option, index) => {
                          const ShareButton = option.component;
                          const ShareIcon = option.icon;

                          return (
                            <ShareButton
                              key={`share-${option.name}-${index}`}
                              {...option.props}
                              className={STYLES.shareOption}
                              onClick={() => setShowShareOptions(false)}
                            >
                              <ShareIcon size={32} round />
                              <span className={STYLES.shareLabel}>{option.name}</span>
                            </ShareButton>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {hasBrochure && (
                  <button
                    className={isDownloading ? STYLES.downloadButtonDisabled : STYLES.downloadButton}
                    onClick={handleDownloadBrochure}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {downloading}
                      </>
                    ) : (
                      <>
                        {downloadBrochure}
                      </>
                    )}
                  </button>
                )}

                <button
                  className={STYLES.bookButton}
                  onClick={() => setShowBookingForm(true)}
                >
                  {bookNow}
                </button>
              </div>
            </div>
          )}

          {showCopyNotification && (
            <div className={STYLES.copyNotification}>
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>

      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        charterData={bookingData}
      />
    </section>
  );
}