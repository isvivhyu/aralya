"use client";

import Navbar from "@/components/Navbar";
import SchoolCard from "@/components/SchoolCard";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import { SchoolService } from "@/lib/schoolService";
import { School } from "@/lib/supabase";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { city: string; schoolCount: number }[]
  >([]);
  const [schoolSearchResults, setSchoolSearchResults] = useState<School[]>([]);
  const [allCities, setAllCities] = useState<
    { city: string; schoolCount: number }[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [featuredSchools, setFeaturedSchools] = useState<School[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLFormElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Load featured schools and all cities on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load featured schools
        const schools = await SchoolService.getFeaturedSchools();
        setFeaturedSchools(schools);

        // Load all cities once
        const cities = await SchoolService.searchCities("");
        setAllCities(cities || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setFeaturedSchools([]);
        setAllCities([]);
      }
    };

    loadData();
  }, []);

  // Helper function to create URL-friendly slugs
  const createSlug = (schoolName: string) => {
    return schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  // Filter cities locally (no API calls)
  const filterCities = (query: string) => {
    if (!query.trim()) {
      return allCities;
    }
    
    const queryLower = query.toLowerCase().trim();
    return allCities.filter((cityData) =>
      cityData.city.toLowerCase().includes(queryLower)
    );
  };

  // Handle search input changes - search schools and cities
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);

    if (query.trim().length === 0) {
      // Show all cities when query is empty
      setSearchResults(allCities);
      setSchoolSearchResults([]);
      return;
    }

    // Filter already-loaded cities
    const filtered = filterCities(query);
    setSearchResults(filtered);

    // Search for schools matching the query (name, curriculum, or city)
    try {
      const schools = await SchoolService.searchSchools(query);
      setSchoolSearchResults(schools.slice(0, 5)); // Limit to 5 for dropdown
    } catch (error) {
      console.error("Error searching schools:", error);
      setSchoolSearchResults([]);
    }
  };

  // Show all cities when input gains focus - no API call needed
  const handleSearchFocus = () => {
    setShowResults(true);
    // Show all cities from already-loaded data
    setSearchResults(allCities);
    setSchoolSearchResults([]);
  };

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to directory with search query
      router.push(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If no search query, go to directory
      router.push("/directory");
    }
  };

  // Handle clicking on a city search result
  const handleCityClick = (city: string) => {
    window.location.href = `/directory?city=${encodeURIComponent(city)}`;
  };

  // Handle clicking on a school search result
  const handleSchoolClick = (school: School) => {
    const slug = createSlug(school.school_name);
    window.location.href = `/directory/${slug}`;
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle filter selection and redirect to directory
  const handleFilterRedirect = (filterType?: string, filterValue?: string) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    // If a specific filter was just set, include it
    if (filterType === "city" && filterValue) {
      params.set("city", filterValue);
    } else if (cityFilter) {
      params.set("city", cityFilter);
    }
    if (filterType === "budget" && filterValue) {
      params.set("budget", filterValue);
    } else if (budgetFilter) {
      params.set("budget", budgetFilter);
    }
    if (filterType === "curriculum" && filterValue) {
      params.set("curriculum", filterValue);
    } else if (curriculumFilter) {
      params.set("curriculum", curriculumFilter);
    }
    router.push(`/directory?${params.toString()}`);
  };

  // Initialize AOS and handle click outside
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 500,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }

      if (isMobile) {
        return;
      }

      // Desktop behavior - close filter dropdowns when clicking outside
      const target = event.target as Element;
      if (filterRef.current && !filterRef.current.contains(target)) {
        setActiveFilter("all");
      }
    };

    // Use click instead of mousedown so option onClick handlers fire first
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobile]);

  return (
    <>
      <section
        className="w-full min-h-screen bg-cover bg-center flex flex-col items-center pb-40 px-5"
        style={{ backgroundImage: "url('/images/Hero.jpg')" }}
      >
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0 z-[1000]">
          <Navbar />
        </div>
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 md:px-0 mt-20 z-1">
          <h1 className="md:text-7xl text-[32px] font-semibold text-white text-center leading-[120%]">
            Find the Right Preschool for Your Little One{" "}
          </h1>
          <p className="mt-6 text-white text-sm md:px-50 px-5 text-center">
            Easily compare tuition, programs, and nearby locations from trusted
            preschools in Metro Manila — no sign-ups, no stress
          </p>
          <form
            id="search-form-mobile"
            onSubmit={handleSearch}
            className="bg-white w-full p-5 rounded-3xl mt-6 relative"
            ref={searchRef}
          >
            <h4 className="text-[#0F0F0F] md:text-2xl text-base font-medium text-center md:text-left">
              Search schools around Metro Manila
            </h4>
            <p className="text-[#774BE5] text-xs flex flex-wrap items-center justify-center md:justify-start mt-1 gap-0.5 text-center md:text-left">
              <span className="font-semibold">Now listing:</span> Taguig{" "}
              <i className="ri-checkbox-blank-circle-fill text-[6px] mt-1"></i>{" "}
              Makati{" "}
              <i className="ri-checkbox-blank-circle-fill text-[6px] mt-1"></i>{" "}
              Pasig{" "}
              <i className="ri-checkbox-blank-circle-fill text-[6px] mt-1"></i>{" "}
              Mandaluyong{" "}
              <i className="ri-checkbox-blank-circle-fill text-[6px] mt-1"></i>{" "}
              Quezon City{" "}
              <i className="ri-checkbox-blank-circle-fill text-[6px] mt-1"></i>{" "}
              Laguna
            </p>
            <p className="text-[#774BE5] text-xs font-normal mt-1 text-center md:text-left">
              We&apos;re still adding more schools each week.
            </p>
            <div className="flex flex-col md:flex-row md:mt-6 mt-3 gap-2.5 rounded-2xl">
              <div className="bg-[#f5f5f5] w-full md:w-[810px] p-3 md:p-4 md:rounded-[10px] rounded-full overflow-hidden flex items-center gap-3 md:gap-5 relative">
                <i className="ri-search-line text-[#0E1C29]/40 text-2xl"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  placeholder="Search by school name, curriculum, or city…"
                  className="bg-transparent w-full text-base text-[#0E1C29] placeholder-[#999999] focus:outline-none"
                  style={{ fontSize: "16px" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setSchoolSearchResults([]);
                      setShowResults(false);
                    }}
                    className="text-[#0E1C29]/40 hover:text-[#0E1C29]/60 transition-colors"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#774BE5] md:w-fit w-full text-white p-4 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-1 hover:bg-[#6B3FD6] transition-colors"
              >
                <i className="ri-search-line text-white text-lg mt-0.5"></i>
                Search
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && (searchResults.length > 0 || schoolSearchResults.length > 0 || searchQuery.trim().length > 0) && (
              <div className="absolute top-full left-2 right-2 md:left-5 md:right-5 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl max-h-80 overflow-auto z-[10001]">
                <div className="p-4">
                  {/* Schools Section */}
                  {schoolSearchResults.length > 0 && (
                    <>
                      <h5 className="text-sm font-semibold text-gray-600 mb-3">
                        Schools ({schoolSearchResults.length})
                      </h5>
                      {schoolSearchResults.map((school, index) => (
                        <div
                          key={`${school.school_name}-${index}`}
                          onClick={() => handleSchoolClick(school)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-2"
                        >
                          <div className="w-12 h-12 rounded-lg bg-[#774BE5]/10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-school-line text-[#774BE5] text-xl"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h6 className="font-semibold text-[#0E1C29] text-sm truncate">
                              {school.school_name}
                            </h6>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {school.city}
                              {school.curriculum_tags && ` • ${school.curriculum_tags.split(", ")[0]}`}
                            </p>
                          </div>
                          <i className="ri-arrow-right-s-line text-gray-400"></i>
                        </div>
                      ))}
                      {searchResults.length > 0 && <div className="border-t border-gray-200 my-3"></div>}
                    </>
                  )}

                  {/* Cities Section */}
                  {searchResults.length > 0 && (
                    <>
                      <h5 className="text-sm font-semibold text-gray-600 mb-3">
                        Cities ({searchResults.length})
                      </h5>
                      {searchResults.map((cityData, index) => (
                        <div
                          key={`${cityData.city}-${index}`}
                          onClick={() => handleCityClick(cityData.city)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg bg-[#774BE5]/10 flex items-center justify-center flex-shrink-0">
                            <i className="ri-map-pin-line text-[#774BE5] text-xl"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h6 className="font-semibold text-[#0E1C29] text-sm truncate">
                              {cityData.city}
                            </h6>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {cityData.schoolCount}{" "}
                              {cityData.schoolCount === 1 ? "school" : "schools"}{" "}
                              available
                            </p>
                          </div>
                          <i className="ri-arrow-right-s-line text-gray-400"></i>
                        </div>
                      ))}
                    </>
                  )}

                  {/* No Results */}
                  {searchResults.length === 0 && schoolSearchResults.length === 0 && searchQuery.trim().length > 0 && (
                    <div className="text-sm text-gray-500 p-2">
                      This school is not in our database yet. We are adding more schools weekly
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Filter Section - Right below search bar */}
          <div className="w-full mt-6 relative z-[999]" ref={filterRef}>
            {/* Desktop Filter Bar - Made bigger and more prominent */}
            <div className="hidden md:flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setBudgetFilter("");
                  setCityFilter("");
                  setCurriculumFilter("");
                }}
                className={`min-w-[100px] px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  activeFilter === "all" && !budgetFilter && !cityFilter && !curriculumFilter
                    ? "bg-[#774BE5] text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                }`}
              >
                <i className="ri-grid-line text-base"></i>
                <span>All</span>
              </button>

              <div className="relative filter-dropdown">
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter(activeFilter === "budget" ? "all" : "budget")
                  }
                  className={`min-w-[130px] px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeFilter === "budget" || budgetFilter
                      ? "bg-[#774BE5] text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                  }`}
                >
                  <i className="ri-money-dollar-circle-line text-base"></i>
                  <span>Budget</span>
                  {budgetFilter && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                  <i className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${activeFilter === "budget" ? "rotate-180" : ""}`}></i>
                </button>

                {activeFilter === "budget" && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg min-w-[180px] max-w-[220px] z-50"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {[
                        { key: "under-100k", label: "Under ₱100k" },
                        { key: "100k-200k", label: "₱100k - ₱200k" },
                        { key: "200k-300k", label: "₱200k - ₱300k" },
                        { key: "300k-500k", label: "₱300k - ₱500k" },
                        { key: "over-500k", label: "Over ₱500k" },
                      ].map((option) => (
                        <button
                          type="button"
                          key={option.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newValue = budgetFilter === option.key ? "" : option.key;
                            setBudgetFilter(newValue);
                            setActiveFilter("all");
                            if (newValue) {
                              handleFilterRedirect("budget", newValue);
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            budgetFilter === option.key
                              ? "bg-[#774BE5] text-white font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {budgetFilter === option.key && (
                              <i className="ri-check-line text-sm"></i>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative filter-dropdown">
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter(activeFilter === "city" ? "all" : "city")
                  }
                  className={`min-w-[130px] px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeFilter === "city" || cityFilter
                      ? "bg-[#774BE5] text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                  }`}
                >
                  <i className="ri-map-pin-line text-base"></i>
                  <span>City</span>
                  {cityFilter && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                  <i className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${activeFilter === "city" ? "rotate-180" : ""}`}></i>
                </button>

                {activeFilter === "city" && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg min-w-[180px] max-w-[220px] max-h-[320px] overflow-y-auto z-50"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {allCities.length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500">
                          Loading cities...
                        </div>
                      ) : (
                        allCities.map((cityData) => (
                          <button
                            type="button"
                            key={cityData.city}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newValue = cityFilter === cityData.city ? "" : cityData.city;
                              setCityFilter(newValue);
                              setActiveFilter("all");
                              if (newValue) {
                                handleFilterRedirect("city", newValue);
                              }
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              cityFilter === cityData.city
                                ? "bg-[#774BE5] text-white font-medium"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{cityData.city}</span>
                              {cityFilter === cityData.city && (
                                <i className="ri-check-line text-sm"></i>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative filter-dropdown z-[100]">
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      activeFilter === "curriculum" ? "all" : "curriculum",
                    )
                  }
                  className={`min-w-[150px] px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeFilter === "curriculum" || curriculumFilter
                      ? "bg-[#774BE5] text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                  }`}
                >
                  <i className="ri-book-open-line text-base"></i>
                  <span>Curriculum</span>
                  {curriculumFilter && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                  <i className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${activeFilter === "curriculum" ? "rotate-180" : ""}`}></i>
                </button>

                {activeFilter === "curriculum" && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-[9999] min-w-[180px] max-w-[220px]"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {[
                        "DepEd",
                        "Montessori",
                        "Christian",
                        "Progressive",
                        "Waldorf",
                        "Reggio Emilia",
                        "IB",
                      ].map((curriculum) => (
                        <button
                          type="button"
                          key={curriculum}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newValue = curriculumFilter === curriculum ? "" : curriculum;
                            setCurriculumFilter(newValue);
                            setActiveFilter("all");
                            if (newValue) {
                              handleFilterRedirect("curriculum", newValue);
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            curriculumFilter === curriculum
                              ? "bg-[#774BE5] text-white font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{curriculum}</span>
                            {curriculumFilter === curriculum && (
                              <i className="ri-check-line text-sm"></i>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Filter Section */}
            <div className="md:hidden mobile-filter-section mt-4">
              {/* Mobile Filter Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-white">
                    Filters
                  </h2>
                  {[budgetFilter, cityFilter, curriculumFilter].filter(Boolean)
                    .length > 0 && (
                    <button
                      onClick={() => {
                        setActiveFilter("all");
                        setBudgetFilter("");
                        setCityFilter("");
                        setCurriculumFilter("");
                      }}
                      className="text-xs text-white font-medium hover:text-white/80 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Quick Filter Pills - Made bigger with cool design */}
                <div className="flex flex-wrap gap-2.5 mb-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveFilter(activeFilter === "budget" ? "all" : "budget");
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                      activeFilter === "budget" || budgetFilter
                        ? "bg-[#774BE5] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <i className={`ri-money-dollar-circle-line text-lg ${activeFilter === "budget" || budgetFilter ? "drop-shadow-sm" : ""}`}></i>
                    <span>Budget</span>
                    {budgetFilter && (
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveFilter(activeFilter === "city" ? "all" : "city");
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                      activeFilter === "city" || cityFilter
                        ? "bg-[#774BE5] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <i className={`ri-map-pin-line text-lg ${activeFilter === "city" || cityFilter ? "drop-shadow-sm" : ""}`}></i>
                    <span>City</span>
                    {cityFilter && (
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveFilter(
                        activeFilter === "curriculum" ? "all" : "curriculum",
                      );
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
                      activeFilter === "curriculum" || curriculumFilter
                        ? "bg-[#774BE5] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <i className={`ri-book-open-line text-lg ${activeFilter === "curriculum" || curriculumFilter ? "drop-shadow-sm" : ""}`}></i>
                    <span>Curriculum</span>
                    {curriculumFilter && (
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Filter Panels */}
              {activeFilter === "budget" && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#0E1C29] flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-[#774BE5] rounded-md flex items-center justify-center">
                          <i className="ri-money-dollar-circle-line text-white text-xs"></i>
                        </div>
                        Budget
                      </h3>
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center transition-colors"
                      >
                        <i className="ri-close-line text-gray-600 text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    {[
                      { key: "under-100k", label: "Under ₱100k" },
                      { key: "100k-200k", label: "₱100k - ₱200k" },
                      { key: "200k-300k", label: "₱200k - ₱300k" },
                      { key: "300k-500k", label: "₱300k - ₱500k" },
                      { key: "over-500k", label: "Over ₱500k" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newValue = budgetFilter === option.key ? "" : option.key;
                          setBudgetFilter(newValue);
                          if (newValue) {
                            handleFilterRedirect("budget", newValue);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          budgetFilter === option.key
                            ? "bg-[#774BE5] text-white font-medium"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {budgetFilter === option.key && (
                            <i className="ri-check-line text-white text-xs"></i>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeFilter === "city" && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#0E1C29] flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-[#774BE5] rounded-md flex items-center justify-center">
                          <i className="ri-map-pin-line text-white text-xs"></i>
                        </div>
                        City
                      </h3>
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center transition-colors"
                      >
                        <i className="ri-close-line text-gray-600 text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5">
                    {allCities.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-500">
                        Loading cities...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {allCities.map((cityData) => (
                          <button
                            key={cityData.city}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newValue = cityFilter === cityData.city ? "" : cityData.city;
                            setCityFilter(newValue);
                            if (newValue) {
                              handleFilterRedirect("city", newValue);
                            }
                          }}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              cityFilter === cityData.city
                                ? "bg-[#774BE5] text-white font-medium"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className="truncate text-left">
                                {cityData.city}
                              </span>
                              {cityFilter === cityData.city && (
                                <i className="ri-check-line text-white text-xs flex-shrink-0"></i>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeFilter === "curriculum" && (
                <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#0E1C29] flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-[#774BE5] rounded-md flex items-center justify-center">
                          <i className="ri-book-open-line text-white text-xs"></i>
                        </div>
                        Curriculum
                      </h3>
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center transition-colors"
                      >
                        <i className="ri-close-line text-gray-600 text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        "DepEd",
                        "Montessori",
                        "Christian",
                        "Progressive",
                        "Waldorf",
                        "Reggio Emilia",
                        "IB",
                      ].map((curriculum) => (
                        <button
                          key={curriculum}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newValue = curriculumFilter === curriculum ? "" : curriculum;
                            setCurriculumFilter(newValue);
                            if (newValue) {
                              handleFilterRedirect("curriculum", newValue);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            curriculumFilter === curriculum
                              ? "bg-[#774BE5] text-white font-medium"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{curriculum}</span>
                            {curriculumFilter === curriculum && (
                              <i className="ri-check-line text-white text-xs flex-shrink-0"></i>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full h-full absolute bg-black/20 z-0"></div>
      </section>

      <section className="w-full md:px-10 px-5 pt-25 bg-white">
        <h2 className="text-[#0E1C29] md:text-[56px] text-4xl font-normal text-center">
          Explore Preschools
        </h2>
        <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5 mt-11">
          {featuredSchools.map((school, index) => (
            <div key={`${school.school_name}-${index}`}>
              <SchoolCard
                imageSrc={school.logo_banner}
                imageAlt={school.school_name}
                schoolName={school.school_name}
                location={school.city}
                tags={school.curriculum_tags.split(", ")}
                priceRange={`${school.min_tuition} - ${school.max_tuition}`}
                schoolSlug={createSlug(school.school_name)}
              />
            </div>
          ))}
        </div>
        <div className="mt-11 mb-25 flex items-center justify-center w-full">
          <div className="w-fit">
            <Link
              href="/directory"
              className="bg-black hover:bg-[#774BE5] transition-all duration-500 ease-in-out rounded-[10px] text-white flex items-center gap-2 px-6 py-3"
            >
              <p className="text-base font-medium">View all schools</p>
              <i className="ri-arrow-right-fill text-lg"></i>
            </Link>
          </div>
        </div>
      </section>

      <div>
        <HowItWorksSection
          title="How Aralya Works"
          description="Find the right preschool in 3 quick steps"
          steps={[
            {
              iconSrc: "/images/map.svg",
              iconAlt: "map",
              stepNumber: 1,
              title: "Choose your city",
              description: "Start with BGC, QC, Makati, Pasig and more.",
            },
            {
              iconSrc: "/images/filter.svg",
              iconAlt: "filter",
              stepNumber: 2,
              title: "Filter by preferences",
              description:
                "Set your budget, curriculum, and schedule preferences.",
            },
            {
              iconSrc: "/images/about.jpg",
              iconAlt: "compare",
              stepNumber: 3,
              title: "Compare and contact",
              description: "Review schools and contact them directly.",
            },
          ]}
        />
      </div>

      <div>
        <FAQSection
          title="Questions? Answers!"
          description="Find quick answers to the most common questions about our platform"
          faqs={[
            {
              question: "Is Aralya free?",
              answer: "Yes-free for parents.",
            },
            {
              question: "Do I need to sign up?",
              answer: "No. No accounts, no forms.",
            },
            {
              question: "How do I contact a school?",
              answer:
                "On the school page, tap Call, Text, Message on FB, or Email.",
            },
            {
              question: "What can I filter by?",
              answer: "City, tuition range, curriculum, and schedule.",
            },
            {
              question: "How accurate are the details?",
              answer: "We confirm with schools and refresh weekly.",
            },
            {
              question: "Which cities are available now?",
              answer: "BGC, QC, Makati, Pasig, Taguig-more coming soon.",
            },
          ]}
        />
      </div>

      <div>
        <AboutSection
          title="About Aralya"
          description="Aralya helps Filipino parents find preschools fast. Compare schools by city, tuition, curriculum, and schedule, then contact the school in one tap-Call, Text, FB Message, or Email. No sign-up. Free for parents. We verify details with schools and refresh weekly so you can decide with confidence."
          featureTitle="What you'll find"
          features={[
            {
              icon: "ri-book-open-line",
              text: "Clear tuition ranges",
            },
            {
              icon: "ri-book-open-line",
              text: "Curriculum tags (Montessori, Progressive, Traditional, Reggio)",
            },
            {
              icon: "ri-book-open-line",
              text: "Schedules (AM/PM/Full-day)",
            },
            {
              icon: "ri-book-open-line",
              text: "City pages: BGC, QC, Makati, Pasig, Taguig - and growing",
            },
          ]}
          imageSrc="/images/about.jpg"
          imageAlt="About Aralya"
        />
      </div>

      <Footer />
    </>
  );
}
