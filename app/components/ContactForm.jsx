'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiMail, FiSend, FiUser, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom hook for scroll lock
const useScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';

      const header = document.querySelector('header');
      if (header) {
        header.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'unset';

      const header = document.querySelector('header');
      if (header) {
        header.style.paddingRight = '';
      }
    }

    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'unset';

      const header = document.querySelector('header');
      if (header) {
        header.style.paddingRight = '';
      }
    };
  }, [isOpen]);
};

// Validation schema
const validateField = (name, value) => {
  switch (name) {
    case 'firstName':
    case 'lastName':
      return value.trim() ? '' : `${name === 'firstName' ? 'First' : 'Last'} name is required`;

    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
      return '';

    case 'phone':
      if (!value.trim()) return 'Phone number is required';
      if (!/^\d{7,15}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number';
      return '';

    case 'message':
      if (!value.trim()) return 'Message is required';
      if (value.trim().length < 10) return 'Message must be at least 10 characters long';
      return '';

    default:
      return '';
  }
};

// Country codes data (code only, no flags or country names for maximum compatibility)
const countryCodes = [
  '+1',
  '+44',
  '+91',
  '+971',
  '+966',
  '+965',
  '+973',
  '+974',
  '+968',
  '+20',
  '+33',
  '+49',
  '+39',
  '+34',
  '+61',
  '+81',
  '+86',
];

// Animation variants
const overlayVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const formVariants = {
  closed: {
    x: '100%',
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      duration: 0.4
    }
  },
  open: {
    x: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      duration: 0.4
    }
  }
};

const ContactForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  // Use scroll lock hook
  useScrollLock(isOpen);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: '+1',
        message: ''
      });
      setErrors({});
      setTouched({});
      setIsClosing(false);
    }
  }, [isOpen]);

  // Animated close handler
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 400); // Match this with animation duration
  }, [onClose]);

  // Validate single field
  const validateSingleField = useCallback((name, value) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  // Handle input changes with validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field if it's been touched before
    if (touched[name]) {
      validateSingleField(name, value);
    }
  }, [touched, validateSingleField]);

  // Handle blur events (mark field as touched)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    setTouched(prev => ({ ...prev, [name]: true }));
    validateSingleField(name, value);
  }, [validateSingleField]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const message = data?.error || 'Failed to send message. Please try again.';
        throw new Error(message);
      }

      toast.success('Message sent successfully! We will get back to you soon.');

      // Reset and close with animation
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input field configuration
  const inputFields = [
    {
      type: 'text',
      name: 'firstName',
      label: 'First Name *',
      placeholder: 'John',
      icon: FiUser,
      grid: true
    },
    {
      type: 'text',
      name: 'lastName',
      label: 'Last Name *',
      placeholder: 'Doe',
      icon: FiUser,
      grid: true
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email Address *',
      placeholder: 'john@example.com',
      icon: FiMail
    }
  ];

  return (
    <>
      <AnimatePresence onExitComplete={() => setIsClosing(false)}>
        {(isOpen || isClosing) && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-[50]"
              initial="closed"
              animate={isClosing ? "closed" : "open"}
              exit="closed"
              variants={overlayVariants}
              onClick={handleClose}
            />

            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-black z-[101] shadow-2xl overflow-y-auto"
              initial="closed"
              animate={isClosing ? "closed" : "open"}
              exit="closed"
              variants={formVariants}
            >
              <div className="p-6 h-full flex flex-col text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white">
                  <h2 className="text-2xl font-light tracking-wide">
                    Get In Touch
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-800 rounded-full transition duration-300"
                    aria-label="Close contact form"
                  >
                    <FiX size={24} className="text-gray-400" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                  {/* Grid Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {inputFields.filter(field => field.grid).map((field) => (
                      <FormField
                        key={field.name}
                        {...field}
                        value={formData[field.name]}
                        error={errors[field.name]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    ))}
                  </div>

                  {/* Single Column Fields */}
                  {inputFields.filter(field => !field.grid).map((field) => (
                    <FormField
                      key={field.name}
                      {...field}
                      value={formData[field.name]}
                      error={errors[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  ))}

                  {/* Phone Field */}
                  <div>
                    <label className="text-base md:text-lg leading-relaxed tracking-wider font-light text-white mb-2">
                      Phone Number *
                    </label>
                    <div className="flex space-x-3">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-28 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-black"
                      >
                        {countryCodes.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-black ${errors.phone ? 'border-text-primary' : 'border-gray-600'
                          }`}
                        placeholder="123 456 7890"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-primary">{errors.phone}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-base md:text-lg leading-relaxed tracking-wider font-light text-white mb-2">
                      Message *
                    </label>
                    <div className="relative">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={4}
                        className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-none bg-white text-black ${errors.message ? 'border-text-primary' : 'border-gray-600'
                          }`}
                        placeholder="Tell us about your yacht charter requirements..."
                      />
                      <FiMessageSquare
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                    </div>
                    {errors.message && (
                      <p className="mt-1 text-sm text-primary">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <SubmitButton isSubmitting={isSubmitting} />
                </form>

                {/* Contact Info - Beautiful Animated Cards */}
                <div className="mb-8 hidden 2xl:grid grid-cols-1 md:grid-cols-2 gap-4  ">
                  {/* Phone Card */}
                  <motion.a
                    href="tel:+15551234567"
                    className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 cursor-pointer group block"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition duration-300">
                        <FiPhone size={20} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Call Us</p>
                        <p className="text-white font-medium group-hover:text-blue-400 transition duration-300">
                          +1 (555) 123-4567
                        </p>
                      </div>
                      <FiArrowRight className="text-gray-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition duration-300" size={18} />
                    </div>
                  </motion.a>

                  {/* Email Card */}
                  <motion.a
                    href="mailto:charter@halayachts.com"
                    className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition-all duration-300 cursor-pointer group block"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition duration-300">
                        <FiMail size={20} className="text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Email Us</p>
                        <p className="text-white font-medium group-hover:text-green-400 transition duration-300">
                          charter@halayachts.com
                        </p>
                      </div>
                      <FiArrowRight className="text-gray-500 group-hover:text-green-400 transform group-hover:translate-x-1 transition duration-300" size={18} />
                    </div>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Reusable Form Field Component
const FormField = ({ type, name, label, placeholder, icon: Icon, value, error, onChange, onBlur }) => (
  <div>
    <label className="block text-base md:text-lg leading-relaxed tracking-wider font-light text-white mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full px-3 py-2 ${Icon ? 'pl-10' : 'pl-3'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 bg-white text-black  ${error ? 'border-text-primary' : 'border-gray-600'
          }`}
        placeholder={placeholder}
      />
      {Icon && <Icon size={18} className="absolute left-3 top-2.5 text-black" />}
    </div>
    {error && <p className="mt-1 text-sm text-primary">{error}</p>}
  </div>
);

// Submit Button Component
const SubmitButton = ({ isSubmitting }) => (
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full bg-text-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isSubmitting ? (
      <>
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>Submitting...</span>
      </>
    ) : (
      <>
        <FiSend size={18} />
        <span>Send Message</span>
      </>
    )}
  </button>
);

export default ContactForm;