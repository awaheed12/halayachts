'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner } from 'react-icons/fa';

const Newsletter = ({
  heading = "Subscribe to Our Luxury Newsletter",
  description = "Be the first to discover new yacht arrivals, exclusive destinations, and luxury travel insights from Hala Yachts.",
  inputPlaceholder = "Enter your email address here...",
  buttonText = "Join Now",
  loadingText = "Subscribing...",
  successMessage = "Welcome to Hala Yachts! You'll receive our luxury updates soon.",
  errorMessage = "Subscription failed. Please try again.",
  bgImage = "/images/newsletter_bg.png",
}) => {

  const TOAST_CONFIG = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    theme: "dark",
    closeButton: false,
    style: { minWidth: 'max-content', fontSize: '16px' }
  };

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // 📩 Handle newsletter form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address', TOAST_CONFIG);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address', TOAST_CONFIG);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // handle duplicate (409) or validation errors
        if (response.status === 409) {
          toast.warning(data.message || "Already subscribed!", TOAST_CONFIG);
        } else {
          toast.error(data.message || errorMessage, TOAST_CONFIG);
        }
      } else {
        toast.success(data.message || successMessage, TOAST_CONFIG);
        setEmail('');
      }

    } catch (error) {
      console.error('Subscription failed:', error);
      toast.error(error.message || errorMessage, TOAST_CONFIG);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderButtonContent = () =>
    isSubmitting ? (
      <span className="flex items-center justify-center">
        <FaSpinner className="animate-spin mr-2" size={18} />
        {loadingText}
      </span>
    ) : (
      buttonText
    );

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.25 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // SSR safe render
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <motion.section
        className="xl:pt-64 xl:pb-24 py-8 px-5 xl:relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="max-w-7xl mx-auto bg-cover bg-center bg-no-repeat rounded-[20px] xl:py-28 sm:py-16 py-10 xl:absolute xl:w-full xl:right-0 xl:left-0 xl:top-13"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          variants={itemVariants}
        >
          <motion.div
            className="flex flex-col sm:gap-7 gap-5 px-5 lg:px-20 sm:px-10 text-white"
            variants={containerVariants}
          >
            <motion.div className="flex flex-col gap-3" variants={itemVariants}>
              <h2 className="text-3xl md:text-6xl xl:text-[65px] font-light leading-tight">{heading}</h2>
              <p className="text-base md:text-lg lg:text-xl tracking-wider font-light opacity-90">{description}</p>
            </motion.div>

            <motion.div className="border-t border-white/30" variants={itemVariants}></motion.div>

            <motion.div className="max-w-full" variants={itemVariants}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:gap-0 gap-5">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={inputPlaceholder}
                      className="w-full px-4 py-3 border border-white/50 sm:rounded-l-lg sm:rounded-r-none rounded
                                 focus:outline-none focus:border-transparent text-[#77747B] placeholder-[#77747B]
                                 font-light tracking-wide bg-[#F2F2F2] backdrop-blur-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !email}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-text-primary text-white px-6 py-3 sm:rounded-l-none sm:rounded-r-lg rounded
                               hover:bg-opacity-90 transition duration-300 font-medium tracking-wide
                               disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {renderButtonContent()}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
      <ToastContainer {...TOAST_CONFIG} />
    </>
  );
};

export default Newsletter;
