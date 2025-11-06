// components/SearchFilter.js
"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiX,
  FiChevronDown,
  FiCheck,
  FiFilter,
} from "react-icons/fi";
import { useSearchParams } from "next/navigation";

// HTML constants for consistent styling
const DROPDOWN_STYLES = {
  container: "relative",
  button:
    "w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:border-text-secondary focus:ring-2 focus:ring-text-secondary transition-all duration-200 flex items-center justify-between",
  buttonText: "text-base leading-relaxed tracking-wider truncate",
  dropdown:
    "absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden",
  searchContainer: "p-2 border-b border-gray-200",
  searchInput:
    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-text-secondary focus:border-text-secondary",
  optionsContainer: "max-h-60 overflow-y-auto",
  option:
    "w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between",
  selectedOption: "bg-text-secondary-50 text-black",
  normalOption: "text-base leading-relaxed tracking-wider",
  clearButton:
    "text-base leading-relaxed tracking-wider w-full text-red-600 hover:text-red-700 py-1 flex items-center justify-center gap-1",
};

const FILTER_CONTAINER_STYLES = {
  main: "",
  header: "flex items-center justify-end mb-4 cursor-pointer",
  title: "text-lg font-semibold text-gray-900",
  clearAll:
    "text-base md:text-lg leading-relaxed tracking-wider font-medium text-secondary hover:text-primary flex items-center gap-1",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4",
  label: "text-base md:text-lg leading-relaxed tracking-wider font-medium",
};

// Mobile Bottom Sheet Styles
const MOBILE_STYLES = {
  overlay: "fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden",
  sheet:
    "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[85vh] overflow-hidden md:hidden transition-transform duration-300 ease-in-out",
  sheetHeader:
    "flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10",
  sheetTitle: "text-xl font-semibold text-gray-900",
  sheetContent: "p-4 pb-20 overflow-y-auto",
  sheetScrollContainer: "max-h-[60vh] overflow-y-auto",
  closeButton: "p-2 rounded-lg hover:bg-gray-100 transition-colors",
  applyButton:
    "w-full bg-text-secondary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary transition-colors mt-10 sticky bottom-4 z-10",
};

const LOCATION_OPTIONS = [
  { value: "all", label: "All Locations" },
  { value: "miami", label: "Miami, Florida" },
  { value: "hampton", label: "The Hampton, New York" },
  { value: "nassau", label: "Nassau, Bahamas" },
  { value: "amalfi", label: "Amalfi Coast, Italy" },
  { value: "mykonos", label: "Mykonos, Greece" },
  { value: "newport", label: "Newport Beach, California" },
  { value: "maine", label: "Maine, USA" },
  { value: "kotor", label: "Kotor, Montenegro" },
  { value: "montauk", label: "Montauk, New York" },
  { value: "cancun", label: "Cancun, Mexico" },
  { value: "abudhabi", label: "Abu Dhabi, UAE" },
  { value: "dubai", label: "Dubai, UAE" },
  { value: "marbella", label: "Marbella, Spain" },
  { value: "barcelona", label: "Barcelona, Spain" },
  { value: "puertorico", label: "Puerto Rico, Caribbean" },
];

const DURATION_OPTIONS = [
  { value: "all", label: "All Durations" },
  { value: "3", label: "3 hrs" },
  { value: "4", label: "4 hrs" },
  { value: "6", label: "6 hrs" },
  { value: "8", label: "8 hrs" },
  { value: "168", label: "7 days" },
];

const LENGTH_OPTIONS = [
  { value: "all", label: "All Lengths" },
  { value: "0-50", label: "Up to 50'" },
  { value: "50-90", label: "50' to 90'" },
  { value: "90+", label: "Over 90'" },
];

const BUDGET_OPTIONS = [
  { value: "all", label: "All Budgets" },
  { value: "0-5000", label: "Up to $5k" },
  { value: "5000-10000", label: "$5k to $10k" },
  { value: "10000-15000", label: "$10k to $15k" },
];

const PASSENGER_OPTIONS = [
  { value: "all", label: "All Passengers" },
  { value: "2", label: "Up to 2" },
  { value: "4", label: "Up to 4" },
  { value: "6", label: "Up to 6" },
  { value: "8", label: "Up to 8" },
  { value: "10+", label: "10+" },
];

const AMENITIES_OPTIONS = [
  { value: "all", label: "All Amenities" },
  { value: "jacuzzi", label: "Jacuzzi" },
  { value: "jet_ski", label: "Jet Ski" },
  { value: "kayak", label: "Kayak" },
  { value: "snorkel_gear", label: "Snorkel Gear" },
  { value: "paddle_board", label: "Paddle Board" },
  { value: "seabob_scooter", label: "Seabob Scooter" },
  { value: "inflatable_island", label: "Inflatable Island" },
  { value: "tender", label: "Tender" },
  { value: "miscellaneous_floats", label: "Miscellaneous Floats" },
];

// Custom width classes for each dropdown based on content
const DROPDOWN_WIDTHS = {
  location: "min-w-[280px]",
  duration: "min-w-[180px]",
  length: "min-w-[160px]",
  budget: "min-w-[160px]",
  amenities: "min-w-[200px]",
  passengers: "min-w-[160px]",
};

const FilterDropdown = ({
  label,
  options,
  value,
  onChange,
  isSearchable = false,
  isMultiSelect = false,
  widthClass = "min-w-[200px]",
  isOpen,
  onToggle,
  onClose,
  isMobile = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = isSearchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue) => {
    if (isMultiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues.length > 0 ? newValues : "all");
    } else {
      onChange(optionValue);
      if (!isMobile) {
        onClose();
        setSearchTerm("");
      }
    }
  };

  const getDisplayValue = () => {
    if (isMultiSelect && Array.isArray(value) && value.length > 0) {
      if (value.includes("all")) return "All Amenities";
      return `${value.length} selected`;
    }
    return options.find((opt) => opt.value === value)?.label || label;
  };

  const clearSelection = () => {
    onChange(isMultiSelect ? [] : "all");
    if (!isMobile && isMultiSelect) onClose();
  };

  const handleButtonClick = () => {
    if (isOpen) {
      onClose();
    } else {
      onToggle();
      setSearchTerm("");
    }
  };

  return (
    <div className={DROPDOWN_STYLES.container}>
      <button onClick={handleButtonClick} className={DROPDOWN_STYLES.button}>
        <span className={DROPDOWN_STYLES.buttonText}>{getDisplayValue()}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`${DROPDOWN_STYLES.dropdown} ${widthClass} ${
            isMobile
              ? "relative mt-2 shadow-none border-0 max-h-48 overflow-y-auto"
              : ""
          }`}
        >
          {isSearchable && (
            <div className={DROPDOWN_STYLES.searchContainer}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={DROPDOWN_STYLES.searchInput}
                  autoFocus={!isMobile}
                />
              </div>
            </div>
          )}

          <div
            className={`${DROPDOWN_STYLES.optionsContainer} ${
              isMobile ? "max-h-32" : ""
            }`}
          >
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`${DROPDOWN_STYLES.option} ${
                  (
                    isMultiSelect
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value
                  )
                    ? DROPDOWN_STYLES.selectedOption
                    : DROPDOWN_STYLES.normalOption
                }`}
              >
                <span className="truncate">{option.label}</span>
                {(isMultiSelect
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value) && (
                  <FiCheck className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {isMultiSelect && Array.isArray(value) && value.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-white sticky bottom-0">
              <button
                onClick={clearSelection}
                className={DROPDOWN_STYLES.clearButton}
              >
                <FiX className="w-3 h-3" />
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mobile Filters Button Component
const MobileFiltersButton = ({ onClick, activeFiltersCount }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 md:hidden">
      <button
        onClick={onClick}
        className="bg-text-secondary text-white px-6 py-4 rounded-full shadow-lg hover:bg-primary transition-all duration-200 flex items-center gap-2 font-semibold text-base min-w-[140px] justify-center"
      >
        <FiFilter className="w-5 h-5" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-white text-secondary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
};

const SearchFilter = ({
  onFilterChange,
  className = "",
  showClearAll = true,
  initialFilters = {},
}) => {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    location: searchParams.get("location") || initialFilters.location || "all",
    duration: searchParams.get("duration") || initialFilters.duration || "all",
    length: searchParams.get("length") || initialFilters.length || "all",
    budget: searchParams.get("budget") || initialFilters.budget || "all",
    passengers:
      searchParams.get("passengers") || initialFilters.passengers || "all",
    amenities:
      searchParams.getAll("amenities") || initialFilters.amenities || "all",
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  // Update temp filters when main filters change
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  // Update filters when URL parameters change
  useEffect(() => {
    const filtersFromUrl = {
      location: searchParams.get("location") || "all",
      duration: searchParams.get("duration") || "all",
      length: searchParams.get("length") || "all",
      budget: searchParams.get("budget") || "all",
      passengers: searchParams.get("passengers") || "all",
      amenities: searchParams.getAll("amenities") || "all",
    };

    setFilters((prevFilters) => ({
      ...prevFilters,
      ...filtersFromUrl,
    }));
  }, [searchParams]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTempFilterChange = (filterType, value) => {
    setTempFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleDropdownToggle = (dropdownName) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
    }
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      location: "all",
      duration: "all",
      length: "all",
      budget: "all",
      amenities: "all",
      passengers: "all",
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setOpenDropdown(null);
  };

  const applyMobileFilters = () => {
    setFilters(tempFilters);
    onFilterChange(tempFilters);
    setIsMobileSheetOpen(false);
  };

  const openMobileSheet = () => {
    setTempFilters(filters);
    setIsMobileSheetOpen(true);
  };

  const closeMobileSheet = () => {
    setIsMobileSheetOpen(false);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all" && (!Array.isArray(value) || value.length > 0)
  );

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "all" && (!Array.isArray(value) || value.length > 0)
  ).length;

  // Desktop Filter Grid Component
  const DesktopFilterGrid = () => (
    <div className={FILTER_CONTAINER_STYLES.grid}>
      {/* Location - Largest dropdown */}
      <div className="flex flex-col gap-1">
        <label className={FILTER_CONTAINER_STYLES.label}>Location</label>
        <FilterDropdown
          label="All Locations"
          options={LOCATION_OPTIONS}
          value={filters.location}
          onChange={(value) => handleFilterChange("location", value)}
          isSearchable={true}
          widthClass={DROPDOWN_WIDTHS.location}
          isOpen={openDropdown === "location"}
          onToggle={() => handleDropdownToggle("location")}
          onClose={handleDropdownClose}
        />
      </div>

      {/* Duration - Medium dropdown */}
      <div className="flex flex-col gap-1">
        <label className={FILTER_CONTAINER_STYLES.label}>Duration</label>
        <FilterDropdown
          label="All Durations"
          options={DURATION_OPTIONS}
          value={filters.duration}
          onChange={(value) => handleFilterChange("duration", value)}
          widthClass={DROPDOWN_WIDTHS.duration}
          isOpen={openDropdown === "duration"}
          onToggle={() => handleDropdownToggle("duration")}
          onClose={handleDropdownClose}
        />
      </div>

      {/* Length - Smaller dropdown */}
      <div className="flex flex-col gap-1">
        <label className={FILTER_CONTAINER_STYLES.label}>Length</label>
        <FilterDropdown
          label="All Lengths"
          options={LENGTH_OPTIONS}
          value={filters.length}
          onChange={(value) => handleFilterChange("length", value)}
          widthClass={DROPDOWN_WIDTHS.length}
          isOpen={openDropdown === "length"}
          onToggle={() => handleDropdownToggle("length")}
          onClose={handleDropdownClose}
        />
      </div>

      {/* Budget - Smaller dropdown */}
      <div className="flex flex-col gap-1">
        <label className={FILTER_CONTAINER_STYLES.label}>Budget</label>
        <FilterDropdown
          label="All Budgets"
          options={BUDGET_OPTIONS}
          value={filters.budget}
          onChange={(value) => handleFilterChange("budget", value)}
          widthClass={DROPDOWN_WIDTHS.budget}
          isOpen={openDropdown === "budget"}
          onToggle={() => handleDropdownToggle("budget")}
          onClose={handleDropdownClose}
        />
      </div>

      {/* Amenities - Medium dropdown */}
      <div className="flex flex-col gap-1">
        <label className={FILTER_CONTAINER_STYLES.label}>Amenities</label>
        <FilterDropdown
          label="All Amenities"
          options={AMENITIES_OPTIONS}
          value={filters.amenities}
          onChange={(value) => handleFilterChange("amenities", value)}
          isMultiSelect={true}
          widthClass={DROPDOWN_WIDTHS.amenities}
          isOpen={openDropdown === "amenities"}
          onToggle={() => handleDropdownToggle("amenities")}
          onClose={handleDropdownClose}
        />
      </div>

      {/* Passengers - Smaller dropdown */}
      <div className="flex flex-col gap-1">
        <label className={FILTER_CONTAINER_STYLES.label}>Passengers</label>
        <FilterDropdown
          label="All Passengers"
          options={PASSENGER_OPTIONS}
          value={filters.passengers}
          onChange={(value) => handleFilterChange("passengers", value)}
          widthClass={DROPDOWN_WIDTHS.passengers}
          isOpen={openDropdown === "passengers"}
          onToggle={() => handleDropdownToggle("passengers")}
          onClose={handleDropdownClose}
        />
      </div>
    </div>
  );

  // Mobile Filter Grid Component
  const MobileFilterGrid = () => (
    <div className="space-y-4">
      {/* Location - Largest dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-gray-900">
          Location
        </label>
        <FilterDropdown
          label="All Locations"
          options={LOCATION_OPTIONS}
          value={tempFilters.location}
          onChange={(value) => handleTempFilterChange("location", value)}
          isSearchable={true}
          widthClass="w-full"
          isOpen={openDropdown === "location"}
          onToggle={() => handleDropdownToggle("location")}
          onClose={handleDropdownClose}
          isMobile={true}
        />
      </div>

      {/* Duration - Medium dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-gray-900">
          Duration
        </label>
        <FilterDropdown
          label="All Durations"
          options={DURATION_OPTIONS}
          value={tempFilters.duration}
          onChange={(value) => handleTempFilterChange("duration", value)}
          widthClass="w-full"
          isOpen={openDropdown === "duration"}
          onToggle={() => handleDropdownToggle("duration")}
          onClose={handleDropdownClose}
          isMobile={true}
        />
      </div>

      {/* Length - Smaller dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-gray-900">Length</label>
        <FilterDropdown
          label="All Lengths"
          options={LENGTH_OPTIONS}
          value={tempFilters.length}
          onChange={(value) => handleTempFilterChange("length", value)}
          widthClass="w-full"
          isOpen={openDropdown === "length"}
          onToggle={() => handleDropdownToggle("length")}
          onClose={handleDropdownClose}
          isMobile={true}
        />
      </div>

      {/* Budget - Smaller dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-gray-900">Budget</label>
        <FilterDropdown
          label="All Budgets"
          options={BUDGET_OPTIONS}
          value={tempFilters.budget}
          onChange={(value) => handleTempFilterChange("budget", value)}
          widthClass="w-full"
          isOpen={openDropdown === "budget"}
          onToggle={() => handleDropdownToggle("budget")}
          onClose={handleDropdownClose}
          isMobile={true}
        />
      </div>

      {/* Amenities - Medium dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-gray-900">
          Amenities
        </label>
        <FilterDropdown
          label="All Amenities"
          options={AMENITIES_OPTIONS}
          value={tempFilters.amenities}
          onChange={(value) => handleTempFilterChange("amenities", value)}
          isMultiSelect={true}
          widthClass="w-full"
          isOpen={openDropdown === "amenities"}
          onToggle={() => handleDropdownToggle("amenities")}
          onClose={handleDropdownClose}
          isMobile={true}
        />
      </div>

      {/* Passengers - Smaller dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-semibold text-gray-900">
          Passengers
        </label>
        <FilterDropdown
          label="All Passengers"
          options={PASSENGER_OPTIONS}
          value={tempFilters.passengers}
          onChange={(value) => handleTempFilterChange("passengers", value)}
          widthClass="w-full"
          isOpen={openDropdown === "passengers"}
          onToggle={() => handleDropdownToggle("passengers")}
          onClose={handleDropdownClose}
          isMobile={true}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div
        className={`${FILTER_CONTAINER_STYLES.main} ${className} hidden md:block`}
      >
        {showClearAll && (
          <div className={FILTER_CONTAINER_STYLES.header}>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className={FILTER_CONTAINER_STYLES.clearAll}
              >
                <FiX className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        )}
        <DesktopFilterGrid />
      </div>

      {/* Mobile Floating Button */}
      <MobileFiltersButton
        onClick={openMobileSheet}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Mobile Bottom Sheet */}
      {isMobileSheetOpen && (
        <div className={MOBILE_STYLES.overlay} onClick={closeMobileSheet}>
          <div
            className={MOBILE_STYLES.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={MOBILE_STYLES.sheetHeader}>
              <h2 className={MOBILE_STYLES.sheetTitle}>Filters</h2>
              <button
                onClick={closeMobileSheet}
                className={MOBILE_STYLES.closeButton}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className={MOBILE_STYLES.sheetContent}>
              {/* Scrollable container for filters */}
              <div className={MOBILE_STYLES.sheetScrollContainer}>
                <MobileFilterGrid />
              </div>
              {/* Sticky Apply Button */}
              <button
                onClick={applyMobileFilters}
                className={MOBILE_STYLES.applyButton}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchFilter;
