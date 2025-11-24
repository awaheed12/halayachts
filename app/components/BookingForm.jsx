'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-toastify/dist/ReactToastify.css';
import 'react-calendar/dist/Calendar.css';
import { GrLocationPin } from "react-icons/gr";
import { GiBackwardTime } from "react-icons/gi";
import { CiCalendarDate } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { GoPeople } from 'react-icons/go';

const STYLES = {
  overlay: "fixed inset-0 z-50 flex justify-end ",
  modal: "bg-white w-full max-w-md sm:h-[95vh] h-full sm:mt-4 sm:mr-4 rounded-xl shadow-2xl overflow-hidden flex flex-col", 
  header: "bg-white p-5 border-b border-gray-100 sticky top-0 z-10 flex flex-col gap-1",
  heading: "text-3xl font-light tracking-wider",
  subheading: "text-sm md:text-base lg:text-lg tracking-wider font-light",
  content: "p-5 flex-1 overflow-y-auto", 
  buttonContainer: "p-5 border-t border-gray-200 bg-white sticky bottom-0", 
  section: "mb-5",
  sectionTitle: "text-lg font-semibold text-gray-800 mb-4",
  radioGroup: "flex justify-between rounded-lg ",
  radioLabel: "flex items-center gap-3 cursor-pointer flex-1",
  radioInput: "w-3 h-3 text-[#542c69] border-2 border-gray-300 rounded-full focus:ring-[#542c69]",
  radioText: "text-lg font-light tracking-wider",
  formGroup: "flex flex-col gap-2 mb-5",
  formGroupRow: "flex gap-4 mb-5",  
  formGroupItem: "flex-1 flex flex-col gap-2",  
  label: "flex gap-1 items-center text-base font-light tracking-wider",
  input: "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer",
  inputLocked: "w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600 text-base font-light tracking-wider",
  timeSlotsGrid: "grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50",
  timeSlot: "px-3 py-2 text-base font-light tracking-wider border border-gray-300 rounded-lg text-center cursor-pointer hover:bg-white hover:border-blue-300 transition-all duration-200 bg-white",
  timeSlotSelected: "px-3 py-2 text-base font-light tracking-wider border-2 border-[#c8a75c]-500 bg-[#c8a75c]-50 text-[#c8a75c] rounded-lg text-center cursor-pointer",
  buttonGroup: "flex gap-4",
  button: "flex-1 p-3 text-base lg:w-2xs w-full md:text-base font-light tracking-wider rounded cursor-pointer rounded-lg font-semibold transition-all duration-300 transform active:scale-95",
  buttonPrimary: "bg-text-primary text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
  buttonSecondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
  buttonDisabled: "bg-gray-300 text-gray-400 cursor-not-allowed transform-none hover:scale-100",
  sliderContainer: "mt-4",
  slider: "w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-[#c8a75c] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg",
  sliderValue: "text-base font-light tracking-wider",
  sliderLabels: "flex justify-between text-xs text-gray-500",
  checkboxGroup: "flex flex-wrap gap-3 items-cemter",
  checkboxLabel: "min-w-[120px] p-2 rounded border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 bg-white hover:shadow-md text-center ",
  checkboxSelected: "border-blue-500 bg-blue-50 shadow-md ",
  checkboxText: "flex flex-col items-center",
  checkboxDuration: "text-base font-light tracking-wider",
  calendarContainer: "mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg",
  calendar: "w-full border-0",
  calendarTile: "rounded-lg hover:bg-blue-100",
  calendarActiveTile: "bg-blue-600 text-white hover:bg-blue-700",
  dateInputContainer: "relative",
  dateInput: "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer bg-white",
  calendarDropdown: "absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-xl"
};

const TIME_SLOTS = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
  "9:00 PM", "9:30 PM", "10:00 PM"
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.9 }
};

const modalVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.3
    }
  }
};

const calendarStyles = `
  .react-calendar {
    border: none !important;
    width: 100% !important;
    font-family: inherit !important;
    font-size:16px !important;
  }
  
  .react-calendar__tile--active {
    background: #c8a75c !important;
    color: white !important;
  }
  
  .react-calendar__tile--now {
    background: #fff !important;
    color: #000 !important;
  }
  
  .react-calendar__tile:hover {
    background: #c8a75c !important;
    color: #fff !important;
  }
  
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background: #c8a75c !important;
  }
  
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #c8a75c !important;
  }
`;

const formatDateForInput = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function BookingForm({
  isOpen,
  onClose,
  charterData
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    charterType: 'day',
    location: charterData?.location || '',
    duration: '',
    date: new Date(),
    time: '',
    passengers: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    yachtTitle: charterData?.yachtTitle || '',
    checkInDate: new Date(),
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    numberOfNights: 1
  });

  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateCalendarRef = useRef(null);
  const checkInCalendarRef = useRef(null);
  const checkOutCalendarRef = useRef(null);

  const availableDurations = charterData?.durations || [];

  const maxPassengers = charterData?.maxPassengers || 10;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateCalendarRef.current && !dateCalendarRef.current.contains(event.target)) {
        setShowDateCalendar(false);
      }
      if (checkInCalendarRef.current && !checkInCalendarRef.current.contains(event.target)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutCalendarRef.current && !checkOutCalendarRef.current.contains(event.target)) {
        setShowCheckOutCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.charterType === 'multiday') {
      const timeDiff = formData.checkOutDate.getTime() - formData.checkInDate.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setFormData(prev => ({
        ...prev,
        numberOfNights: nights > 0 ? nights : 1
      }));
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.charterType]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFormData({
          charterType: 'day',
          location: charterData?.location || '',
          duration: '',
          date: new Date(),
          time: '',
          passengers: 1,
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
          yachtTitle: charterData?.yachtTitle || '',
          checkInDate: new Date(),
          checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
          numberOfNights: 1
        });
        setCurrentStep(1);
        setShowDateCalendar(false);
        setShowCheckInCalendar(false);
        setShowCheckOutCalendar(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, charterData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (date) => {
    handleInputChange('date', date);
    setShowDateCalendar(false);
  };

  const handleCheckInSelect = (date) => {
    handleInputChange('checkInDate', date);
    setShowCheckInCalendar(false);
  };

  const handleCheckOutSelect = (date) => {
    handleInputChange('checkOutDate', date);
    setShowCheckOutCalendar(false);
  };

  const handleStep1Continue = () => {
    if (formData.charterType === 'day') {
      if (formData.duration && formData.date && formData.time && formData.passengers) {
        setCurrentStep(2);
      }
    } else {
      if (formData.checkInDate && formData.checkOutDate && formData.passengers) {
        setCurrentStep(2);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare booking data for MongoDB
      const bookingData = {
        ...formData,
        yachtTitle: charterData?.yachtTitle || 'Unknown Yacht',
        location: charterData?.location || '',
        // Convert dates to ISO strings for MongoDB
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
        checkInDate: formData.checkInDate instanceof Date ? formData.checkInDate.toISOString() : formData.checkInDate,
        checkOutDate: formData.checkOutDate instanceof Date ? formData.checkOutDate.toISOString() : formData.checkOutDate,
      };

      // Send to backend API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Booking submission failed');
      }

      console.log('Booking submitted successfully:', result);

      toast.success('Booking submitted successfully! We will contact you soon.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.message || 'Booking failed. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.charterType === 'day' 
    ? formData.duration && formData.date && formData.time && formData.passengers
    : formData.checkInDate && formData.checkOutDate && formData.passengers;

  const isStep2Valid = formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <style jsx global>{calendarStyles}</style>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-50"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
            />

            <motion.div
              className={STYLES.overlay}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className={STYLES.modal}
                variants={contentVariants}
              >
                <div className={STYLES.header}>
                  <h2 className={STYLES.heading}>Book Your Charter</h2>
                  <p className={STYLES.subheading}>Complete your booking in just a few steps</p>
                </div>

                <div className={STYLES.content}>
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={STYLES.section}>
                        <div className={STYLES.radioGroup}>
                          <label className={STYLES.radioLabel}>
                            <input
                              type="radio"
                              name="charterType"
                              value="day"
                              checked={formData.charterType === 'day'}
                              onChange={(e) => handleInputChange('charterType', e.target.value)}
                              className={STYLES.radioInput}
                            />
                            <span className={STYLES.radioText}>Day Charter</span>
                          </label>
                          <label className={STYLES.radioLabel}>
                            <input
                              type="radio"
                              name="charterType"
                              value="multiday"
                              checked={formData.charterType === 'multiday'}
                              onChange={(e) => handleInputChange('charterType', e.target.value)}
                              className={STYLES.radioInput}
                            />
                            <span className={STYLES.radioText}>Multiday Charter</span>
                          </label>
                        </div>
                      </div>

                      <div className={STYLES.formGroup}>
                        <label className={STYLES.label}><span><GrLocationPin /> </span> Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          readOnly
                          className={STYLES.inputLocked}
                        />
                      </div>

                      {formData.charterType === 'day' ? (
                        <>
                          <div className={STYLES.formGroup}>
                            <label className={STYLES.label}><span><GiBackwardTime /> </span> Select Duration</label>
                            <div className={STYLES.checkboxGroup}>
                              {availableDurations.map((duration, index) => (
                                <motion.div
                                  key={index}
                                  className={`${STYLES.checkboxLabel} ${formData.duration === duration ? STYLES.checkboxSelected : ''}`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleInputChange('duration', duration)}
                                >
                                  <div className={STYLES.checkboxText}>
                                    <div className={STYLES.checkboxDuration}>{duration}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          <div className={STYLES.formGroup}>
                            <label className={STYLES.label}><span><CiCalendarDate /> </span>Select Date</label>
                            <div className={STYLES.dateInputContainer} ref={dateCalendarRef}>
                              <input
                                type="text"
                                value={formatDateForInput(formData.date)}
                                readOnly
                                className={STYLES.dateInput}
                                onClick={() => setShowDateCalendar(!showDateCalendar)}
                                placeholder="Select date"
                              />
                              <AnimatePresence>
                                {showDateCalendar && (
                                  <motion.div
                                    className={STYLES.calendarDropdown}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                  >
                                    <Calendar
                                      onChange={handleDateSelect}
                                      value={formData.date}
                                      minDate={new Date()}
                                      className={STYLES.calendar}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <div className={STYLES.formGroup}>
                            <label className={STYLES.label}><span><IoTimeOutline /></span> Preferred Time</label>
                            <div className={STYLES.timeSlotsGrid}>
                              {TIME_SLOTS.map((timeSlot) => (
                                <motion.div
                                  key={timeSlot}
                                  className={formData.time === timeSlot ? STYLES.timeSlotSelected : STYLES.timeSlot}
                                  onClick={() => handleInputChange('time', timeSlot)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {timeSlot}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={STYLES.formGroup}>
                            <label className={STYLES.label}><span><CiCalendarDate /> </span>Check-in Date</label>
                            <div className={STYLES.dateInputContainer} ref={checkInCalendarRef}>
                              <input
                                type="text"
                                value={formatDateForInput(formData.checkInDate)}
                                readOnly
                                className={STYLES.dateInput}
                                onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                                placeholder="Select check-in date"
                              />
                              <AnimatePresence>
                                {showCheckInCalendar && (
                                  <motion.div
                                    className={STYLES.calendarDropdown}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                  >
                                    <Calendar
                                      onChange={handleCheckInSelect}
                                      value={formData.checkInDate}
                                      minDate={new Date()}
                                      className={STYLES.calendar}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <div className={STYLES.formGroup}>
                            <label className={STYLES.label}><span><CiCalendarDate /> </span>Check-out Date</label>
                            <div className={STYLES.dateInputContainer} ref={checkOutCalendarRef}>
                              <input
                                type="text"
                                value={formatDateForInput(formData.checkOutDate)}
                                readOnly
                                className={STYLES.dateInput}
                                onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                                placeholder="Select check-out date"
                              />
                              <AnimatePresence>
                                {showCheckOutCalendar && (
                                  <motion.div
                                    className={STYLES.calendarDropdown}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                  >
                                    <Calendar
                                      onChange={handleCheckOutSelect}
                                      value={formData.checkOutDate}
                                      minDate={formData.checkInDate}
                                      className={STYLES.calendar}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <div className={STYLES.formGroup}>
                            <label className={STYLES.label}><span><GiBackwardTime /> </span> Number of Nights</label>
                            <div className={STYLES.inputLocked}>
                              {formData.numberOfNights} {formData.numberOfNights === 1 ? 'night' : 'nights'}
                            </div>
                          </div>
                        </>
                      )}

                      <div className={STYLES.formGroup}>
                        <label className={STYLES.label}>
                          <span><GoPeople /> </span> Number of Passengers (Max: {maxPassengers})
                        </label>
                        <div className={STYLES.sliderContainer}>
                          <div className={STYLES.sliderValue}>
                            {formData.passengers} {formData.passengers === 1 ? 'person' : 'people'}
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={maxPassengers}
                            value={formData.passengers}
                            onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                            className={STYLES.slider}
                          />
                          <div className={STYLES.sliderLabels}>
                            <span className="text-base font-light tracking-wider">1</span>
                            <span className="text-base font-light tracking-wider">{maxPassengers}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.form
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={STYLES.formGroupRow}>
                        <div className={STYLES.formGroupItem}>
                          <label className={STYLES.label}>First Name</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={STYLES.input}
                            required
                            placeholder="First name"
                          />
                        </div>
                        <div className={STYLES.formGroupItem}>
                          <label className={STYLES.label}>Last Name</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={STYLES.input}
                            required
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div className={STYLES.formGroupRow}>
                        <div className={STYLES.formGroupItem}>
                          <label className={STYLES.label}>Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={STYLES.input}
                            required
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <div className={STYLES.formGroupItem}>
                          <label className={STYLES.label}>Phone Number</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={STYLES.input}
                            required
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className={STYLES.formGroup}>
                        <label className={STYLES.label}>Additional Message (Optional)</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className={STYLES.input}
                          rows="4"
                          placeholder="Any special requests or requirements..."
                        />
                      </div>
                    </motion.form>
                  )}
                </div>

                <div className={STYLES.buttonContainer}>
                  <div className={STYLES.buttonGroup}>
                    {currentStep === 1 ? (
                      <>
                        <motion.button
                          onClick={onClose}
                          className={`${STYLES.button} ${STYLES.buttonSecondary}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={handleStep1Continue}
                          disabled={!isStep1Valid}
                          className={`${STYLES.button} ${STYLES.buttonPrimary} ${!isStep1Valid ? STYLES.buttonDisabled : ''}`}
                          whileHover={isStep1Valid ? { scale: 1.02 } : {}}
                          whileTap={isStep1Valid ? { scale: 0.98 } : {}}
                        >
                          Continue
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className={`${STYLES.button} ${STYLES.buttonSecondary}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          ← Back
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={!isStep2Valid || isSubmitting}
                          className={`${STYLES.button} ${STYLES.buttonPrimary} ${(!isStep2Valid || isSubmitting) ? STYLES.buttonDisabled : ''}`}
                          whileHover={(!isStep2Valid || isSubmitting) ? {} : { scale: 1.02 }}
                          whileTap={(!isStep2Valid || isSubmitting) ? {} : { scale: 0.98 }}
                          onClick={handleSubmit}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              Processing...
                            </span>
                          ) : (
                            'Confirm Booking'
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}