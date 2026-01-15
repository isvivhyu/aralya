"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SchoolCard from "@/components/SchoolCard";
import { SchoolCardSkeleton } from "@/components/SchoolCardSkeleton";
import { SchoolService } from "@/lib/schoolService";
import { School } from "@/lib/supabase";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner, ButtonWithLoading } from "@/components/LoadingSpinner";

// Helper function to check if a school is in a specific city
// Uses the same matching logic as SchoolService for consistency
const isSchoolInCity = (school: School, targetCity: string): boolean => {
  if (!school.city || !targetCity) return false;

  const normalizedTargetCity = targetCity.trim().toLowerCase();

  // Split by comma and check each city using the same matching logic
  const cities = school.city
    .split(",")
    .map((city: string) => city.trim().toLowerCase());

  return cities.some((city: string) =>
    SchoolService.citiesMatch(normalizedTargetCity, city),
  );
};

// Component that uses useSearchParams - needs to be wrapped in Suspense
const SchoolDirectoryContent = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const cityQuery = searchParams.get("city") || "";
  const budgetQuery = searchParams.get("budget") || "";
  const curriculumQuery = searchParams.get("curriculum") || "";

  const [displayedSchools, setDisplayedSchools] = useState<School[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [activeFilter, setActiveFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState(budgetQuery);
  const [cityFilter, setCityFilter] = useState(cityQuery);
  const [curriculumFilter, setCurriculumFilter] = useState(curriculumQuery);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [availableCities, setAvailableCities] = useState<
    { city: string; schoolCount: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "city" | "budget" | "curriculum"
  >("all");
  const observerRef = useRef<HTMLDivElement>(null);

  const schoolsPerPage = 12; // Load 12 schools at a time

  // Get placeholder text based on active category
  const getPlaceholder = () => {
    switch (activeCategory) {
      case "city":
        return "Enter a city (e.g., Pasig, Makati, Taguig…)";
      case "budget":
        return "Enter your budget (e.g., ₱50,000 – ₱100,000)";
      case "curriculum":
        return "Search by curriculum (e.g., Montessori, Progressive…)";
      default:
        return "Search by school name, city, or curriculum…";
    }
  };

  const categories = [
    { id: "all" as const, label: "All Schools", icon: "ri-grid-line" },
    { id: "city" as const, label: "By City", icon: "ri-map-pin-line" },
    {
      id: "budget" as const,
      label: "By Budget",
      icon: "ri-money-dollar-circle-line",
    },
    {
      id: "curriculum" as const,
      label: "By Curriculum",
      icon: "ri-book-open-line",
    },
  ];

  // Helper function to create URL-friendly slugs
  const createSlug = (schoolName: string) => {
    return schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  // Helper function to check if a string is a number (budget amount)
  const isNumericQuery = (query: string): boolean => {
    // Remove common currency symbols and whitespace
    const cleaned = query.trim().replace(/[₱$,]/g, "");
    // Check if it's a valid number
    return /^\d+(\.\d+)?$/.test(cleaned) && parseFloat(cleaned) > 0;
  };

  // Helper function to parse budget amount from query
  const parseBudgetAmount = (query: string): number => {
    const cleaned = query.trim().replace(/[₱$,]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Helper function to filter schools by budget amount
  const filterByBudgetAmount = (
    schools: School[],
    budgetAmount: number,
  ): School[] => {
    return schools.filter((school) => {
      try {
        // Skip schools with non-numeric tuition values (e.g., "Fees Disclosed upon visitation")
        if (
          isNaN(parseFloat(school.min_tuition.replace(/[^\d.]/g, ""))) ||
          isNaN(parseFloat(school.max_tuition.replace(/[^\d.]/g, "")))
        ) {
          return false;
        }

        // Parse min and max tuition, removing currency symbols and commas
        const minPrice = parseFloat(school.min_tuition.replace(/[^\d.]/g, ""));
        const maxPrice = parseFloat(school.max_tuition.replace(/[^\d.]/g, ""));

        // Check if the entered budget amount falls within the school's tuition range
        // This means the user's budget can afford this school
        return budgetAmount >= minPrice && budgetAmount <= maxPrice;
      } catch (error) {
        // If parsing fails, exclude the school
        return false;
      }
    });
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  // Helper function to update URL with current filters
  const updateURLWithFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (localSearchQuery.trim()) {
      params.set("search", localSearchQuery.trim());
    }
    if (budgetFilter) {
      params.set("budget", budgetFilter);
    }
    if (cityFilter) {
      params.set("city", cityFilter);
    }
    if (curriculumFilter) {
      params.set("curriculum", curriculumFilter);
    }

    const url = params.toString()
      ? `/directory?${params.toString()}`
      : "/directory";
    window.history.replaceState({}, "", url);
  }, [localSearchQuery, budgetFilter, cityFilter, curriculumFilter]);

  // Handle form submission - update URL with search query
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      if (localSearchQuery.trim()) {
        const params = new URLSearchParams();
        params.set("search", localSearchQuery.trim());
        if (budgetFilter) params.set("budget", budgetFilter);
        if (cityFilter) params.set("city", cityFilter);
        if (curriculumFilter) params.set("curriculum", curriculumFilter);
        window.location.href = `/directory?${params.toString()}`;
      } else {
        const params = new URLSearchParams();
        if (budgetFilter) params.set("budget", budgetFilter);
        if (cityFilter) params.set("city", cityFilter);
        if (curriculumFilter) params.set("curriculum", curriculumFilter);
        const queryString = params.toString();
        window.location.href = `/directory${queryString ? `?${queryString}` : ""}`;
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      // Reset after navigation starts
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  // Update URL when filters change (but not when syncing from URL params)
  const isSyncingFromURL = useRef(false);

  useEffect(() => {
    if (isSyncingFromURL.current) {
      isSyncingFromURL.current = false;
      return;
    }
    updateURLWithFilters();
  }, [budgetFilter, cityFilter, curriculumFilter, updateURLWithFilters]);

  // Sync localSearchQuery with URL searchQuery
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Sync filters with URL params
  useEffect(() => {
    isSyncingFromURL.current = true;
    setBudgetFilter(budgetQuery);
    setCityFilter(cityQuery);
    setCurriculumFilter(curriculumQuery);
  }, [budgetQuery, cityQuery, curriculumQuery]);

  // Debug activeFilter changes
  useEffect(() => {
    console.log("activeFilter changed to:", activeFilter);
    console.log(
      "Rendering mobile filters, activeFilter:",
      activeFilter,
      "isMobile:",
      isMobile,
    );
  }, [activeFilter, isMobile]);

  // Load available cities from database
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await SchoolService.searchCities("");
        setAvailableCities(cities);
      } catch (error) {
        console.error("Error loading cities:", error);
        setAvailableCities([]);
      }
    };

    loadCities();
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile, activeFilter]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile) {
        // On mobile, only close search results, never close filter panels
        console.log("Mobile detected - not closing filter panels");
        return;
      }

      // Desktop behavior - close filter dropdowns when clicking outside
      const target = event.target as Element;
      if (!target.closest(".filter-dropdown")) {
        console.log(
          "Desktop - closing filter, activeFilter was:",
          activeFilter,
        );
        setActiveFilter("all");
      }
    };

    // Use click instead of mousedown so filter option onClick handlers fire first
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeFilter, isMobile]);

  // Apply filters to schools
  const applyFilters = useCallback(
    (schools: School[]) => {
      let filtered = schools;

      // Apply budget filter
      if (budgetFilter) {
        const budgetRanges = {
          "under-100k": { min: 0, max: 100000 },
          "100k-200k": { min: 100000, max: 200000 },
          "200k-300k": { min: 200000, max: 300000 },
          "300k-500k": { min: 300000, max: 500000 },
          "over-500k": { min: 500000, max: Infinity },
        };

        const range = budgetRanges[budgetFilter as keyof typeof budgetRanges];
        if (range) {
          filtered = filtered.filter((school) => {
            const minPrice = parseFloat(
              school.min_tuition.replace(/[^\d.]/g, ""),
            );
            const maxPrice = parseFloat(
              school.max_tuition.replace(/[^\d.]/g, ""),
            );
            return (
              (minPrice >= range.min && minPrice <= range.max) ||
              (maxPrice >= range.min && maxPrice <= range.max)
            );
          });
        }
      }

      // Apply city filter
      if (cityFilter) {
        filtered = filtered.filter((school) =>
          isSchoolInCity(school, cityFilter),
        );
      }

      // Apply curriculum filter
      if (curriculumFilter) {
        filtered = filtered.filter((school) => {
          const curriculumTags = school.curriculum_tags.toLowerCase();
          return curriculumTags.includes(curriculumFilter.toLowerCase());
        });
      }

      return filtered;
    },
    [budgetFilter, cityFilter, curriculumFilter],
  );

  // Filter schools based on search query and filters
  useEffect(() => {
    const loadFilteredSchools = async () => {
      // Only show filtering spinner if not initial load
      if (!initialLoading) {
        setIsFiltering(true);
      }
      try {
        let searchFiltered: School[];

        if (searchQuery.trim().length > 0) {
          // Check if the query is a numeric budget amount
          if (isNumericQuery(searchQuery)) {
            // If it's a number, get all schools and filter by budget
            const allSchools = await SchoolService.getAllSchools();
            const budgetAmount = parseBudgetAmount(searchQuery);
            searchFiltered = filterByBudgetAmount(allSchools, budgetAmount);
          } else {
            // If it's text, search across school name, curriculum, and city
            searchFiltered = await SchoolService.searchSchools(searchQuery);
          }
        } else {
          // Otherwise, get all schools
          searchFiltered = await SchoolService.getAllSchools();
        }
        const finalFiltered = applyFilters(searchFiltered);
        setFilteredSchools(finalFiltered);
      } catch (error) {
        console.error("Error loading filtered schools:", error);
        setFilteredSchools([]);
      } finally {
        setInitialLoading(false);
        setIsFiltering(false);
      }
    };

    loadFilteredSchools();
  }, [searchQuery, budgetFilter, cityFilter, curriculumFilter, applyFilters]);

  // Load all schools at once (no pagination needed)
  useEffect(() => {
    setDisplayedSchools(filteredSchools);
    setCurrentPage(1);
    setHasMore(false);
  }, [filteredSchools]);

  // Load more schools function
  const loadMoreSchools = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const startIndex = currentPage * schoolsPerPage;
      const endIndex = startIndex + schoolsPerPage;
      const newSchools = filteredSchools.slice(startIndex, endIndex);

      if (newSchools.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedSchools((prev) => [...prev, ...newSchools]);
        setCurrentPage((prev) => prev + 1);
      }

      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, currentPage, filteredSchools, schoolsPerPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreSchools();
        }
      },
      { threshold: 0.1 },
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [currentPage, hasMore, isLoading, loadMoreSchools]);

  if (initialLoading) {
    return (
      <>
        <Navbar />
        <section className="w-full md:px-10 px-5 pt-25 bg-white">
          <h2 className="text-[#0E1C29] md:text-[56px] text-4xl font-normal text-center">
            Explore Preschools
          </h2>
          <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5 mt-11">
            {Array.from({ length: 6 }).map((_, index) => (
              <SchoolCardSkeleton key={index} />
            ))}
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section
        className="w-full h-fit bg-cover bg-center flex flex-col items-center pb-40 px-5 relative"
        style={{ backgroundImage: "url('/images/Hero.jpg')" }}
      >
        <div className="w-full h-full absolute top-0 left-0 bg-black/20 z-0"></div>
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0 relative z-[1000]">
          <Navbar />
        </div>
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 md:px-0 mt-20 relative">
          <h1 className="md:text-[56px] text-[32px] font-regular text-white text-center leading-[120%]">
            Find Preschools
          </h1>
          <p className="text-gray-100 text-xs flex flex-wrap text-center md:text-left justify-center md:justify-start items-center gap-0.5">
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
          <p className="text-gray-100 text-xs font-normal mt-1 text-center md:text-left">
            We&apos;re still adding more schools each week.
          </p>
          <form
            className="bg-white w-full p-5 rounded-3xl mt-6 relative"
            onSubmit={handleSearchSubmit}
          >
            {/* Category Tabs Section */}
            <div className="w-full relative z-[999]">
              <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide md:flex-wrap flex-nowrap">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 md:px-6 py-2.5 md:py-3 text-sm font-semibold flex items-center gap-2 text-black relative shrink-0 ${
                      activeCategory === category.id
                        ? "border-b-2 border-black"
                        : "border-b-2 border-transparent"
                    } transition-all duration-300 ease-in-out`}
                  >
                    <i className={`${category.icon} text-base`}></i>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:mt-6 mt-3 gap-2.5 rounded-2xl">
              <div className="bg-[#f5f5f5] w-full md:w-[810px] p-3 md:p-4 md:rounded-[10px] rounded-full overflow-hidden flex items-center gap-3 md:gap-5 relative">
                <i className="ri-search-line text-[#0E1C29]/40 text-2xl"></i>
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  placeholder={getPlaceholder()}
                  className="bg-transparent w-full text-base text-[#0E1C29] placeholder-[#999999] focus:outline-none"
                  style={{ fontSize: "16px" }}
                />
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLocalSearchQuery("")}
                    className="text-[#0E1C29]/40 hover:text-[#0E1C29]/60 transition-colors"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                )}
              </div>
              <ButtonWithLoading
                type="submit"
                isLoading={isSearching}
                className="bg-[#774BE5] md:w-fit w-full text-white p-4 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-1 hover:bg-[#6B3FD6] transition-colors disabled:hover:bg-[#774BE5]"
              >
                <i className="ri-search-line text-white text-lg mt-0.5"></i>
                Search
              </ButtonWithLoading>
            </div>
          </form>

          {/* Filter Section - Right below search bar */}
          <div className="w-full mt-6 relative z-[999]">
            {/* Desktop Filter Bar - Made bigger and more prominent */}
            <div className="hidden md:flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setBudgetFilter("");
                  setCityFilter("");
                  setCurriculumFilter("");
                  window.history.replaceState({}, "", "/directory");
                }}
                className={`min-w-[100px] px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  activeFilter === "all" &&
                  !budgetFilter &&
                  !cityFilter &&
                  !curriculumFilter
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
                    setActiveFilter(
                      activeFilter === "budget" ? "all" : "budget",
                    )
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
                  <i
                    className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${activeFilter === "budget" ? "rotate-180" : ""}`}
                  ></i>
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
                            setBudgetFilter(
                              budgetFilter === option.key ? "" : option.key,
                            );
                            setActiveFilter("all");
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
                  <i
                    className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${activeFilter === "city" ? "rotate-180" : ""}`}
                  ></i>
                </button>

                {activeFilter === "city" && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg min-w-[180px] max-w-[220px] max-h-[320px] overflow-y-auto z-50"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {availableCities.length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-gray-500">
                          Loading cities...
                        </div>
                      ) : (
                        availableCities.map((cityData) => (
                          <button
                            type="button"
                            key={cityData.city}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newValue =
                                cityFilter === cityData.city
                                  ? ""
                                  : cityData.city;
                              setCityFilter(newValue);
                              setActiveFilter("all");
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
                  <i
                    className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${activeFilter === "curriculum" ? "rotate-180" : ""}`}
                  ></i>
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
                            const newValue =
                              curriculumFilter === curriculum ? "" : curriculum;
                            setCurriculumFilter(newValue);
                            setActiveFilter("all");
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
            <div className="md:hidden mobile-filter-section mt-4 -mx-5 px-5">
              {/* Mobile Filter Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  {[budgetFilter, cityFilter, curriculumFilter].filter(Boolean)
                    .length > 0 && (
                    <button
                      onClick={() => {
                        setActiveFilter("all");
                        setBudgetFilter("");
                        setCityFilter("");
                        setCurriculumFilter("");
                        window.history.replaceState({}, "", "/directory");
                      }}
                      className="text-xs text-[#774BE5] font-medium hover:text-[#774BE5]/80 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Quick Filter Pills - Made bigger with cool design */}
                <div className="flex flex-nowrap gap-2.5 mb-3 overflow-x-auto overflow-y-hidden scrollbar-hide">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Budget pill clicked, current activeFilter:",
                        activeFilter,
                      );
                      const newFilter =
                        activeFilter === "budget" ? "all" : "budget";
                      console.log("Setting activeFilter to:", newFilter);
                      setActiveFilter(newFilter);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                      activeFilter === "budget" || budgetFilter
                        ? "bg-[#774BE5] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <i
                      className={`ri-money-dollar-circle-line text-lg ${activeFilter === "budget" || budgetFilter ? "drop-shadow-sm" : ""}`}
                    ></i>
                    <span>Budget</span>
                    {budgetFilter && (
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "City pill clicked, current activeFilter:",
                        activeFilter,
                      );
                      setActiveFilter(activeFilter === "city" ? "all" : "city");
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                      activeFilter === "city" || cityFilter
                        ? "bg-[#774BE5] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <i
                      className={`ri-map-pin-line text-lg ${activeFilter === "city" || cityFilter ? "drop-shadow-sm" : ""}`}
                    ></i>
                    <span>City</span>
                    {cityFilter && (
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Curriculum pill clicked, current activeFilter:",
                        activeFilter,
                      );
                      setActiveFilter(
                        activeFilter === "curriculum" ? "all" : "curriculum",
                      );
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 ${
                      activeFilter === "curriculum" || curriculumFilter
                        ? "bg-[#774BE5] text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <i
                      className={`ri-book-open-line text-lg ${activeFilter === "curriculum" || curriculumFilter ? "drop-shadow-sm" : ""}`}
                    ></i>
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
                          console.log("Budget filter clicked:", option.key);
                          setBudgetFilter(
                            budgetFilter === option.key ? "" : option.key,
                          );
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
                    {availableCities.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-500">
                        Loading cities...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {availableCities.map((cityData) => (
                          <button
                            key={cityData.city}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(
                                "City filter clicked:",
                                cityData.city,
                              );
                              setCityFilter(
                                cityFilter === cityData.city
                                  ? ""
                                  : cityData.city,
                              );
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
                            setCurriculumFilter(
                              curriculumFilter === curriculum ? "" : curriculum,
                            );
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
      </section>

      <section className="w-full md:px-10 px-5 pb-25 pt-10 bg-white">
        {(searchQuery || cityQuery) && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#0E1C29] mb-2">
              {cityQuery
                ? `Schools in ${cityQuery}`
                : `Search Results for "${searchQuery}"`}
            </h2>
            <p className="text-gray-600">
              Found {filteredSchools.length} school
              {filteredSchools.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Active Filter Chips */}
        {(budgetFilter || cityFilter || curriculumFilter) && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {budgetFilter && (
                <div className="flex items-center gap-2 bg-[#774BE5]/10 text-[#774BE5] px-3 py-2 rounded-full text-sm font-medium">
                  <i className="ri-money-dollar-circle-line"></i>
                  <span>
                    {
                      [
                        { key: "under-100k", label: "Under ₱100k" },
                        { key: "100k-200k", label: "₱100k - ₱200k" },
                        { key: "200k-300k", label: "₱200k - ₱300k" },
                        { key: "300k-500k", label: "₱300k - ₱500k" },
                        { key: "over-500k", label: "Over ₱500k" },
                      ].find((opt) => opt.key === budgetFilter)?.label
                    }
                  </span>
                  <button
                    onClick={() => setBudgetFilter("")}
                    className="hover:bg-[#774BE5]/20 rounded-full p-1 transition-colors"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              )}
              {cityFilter && (
                <div className="flex items-center gap-2 bg-[#774BE5]/10 text-[#774BE5] px-3 py-2 rounded-full text-sm font-medium">
                  <i className="ri-map-pin-line"></i>
                  <span>{cityFilter}</span>
                  <button
                    onClick={() => setCityFilter("")}
                    className="hover:bg-[#774BE5]/20 rounded-full p-1 transition-colors"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              )}
              {curriculumFilter && (
                <div className="flex items-center gap-2 bg-[#774BE5]/10 text-[#774BE5] px-3 py-2 rounded-full text-sm font-medium">
                  <i className="ri-book-open-line"></i>
                  <span>{curriculumFilter}</span>
                  <button
                    onClick={() => setCurriculumFilter("")}
                    className="hover:bg-[#774BE5]/20 rounded-full p-1 transition-colors"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setBudgetFilter("");
                  setCityFilter("");
                  setCurriculumFilter("");
                  window.history.replaceState({}, "", "/directory");
                }}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Desktop Info Text */}
        <div className="hidden md:block mb-6">
          <h6 className="font-medium text-black text-sm">
            We&apos;re still adding more preschools across Metro Manila.
          </h6>
        </div>

        {/* Mobile Info Text */}
        <div className="md:hidden mb-6">
          <h6 className="font-medium text-black text-sm">
            We&apos;re still adding more preschools across Metro Manila.
          </h6>
        </div>

        {/* Results Summary */}
        <div className="mt-8 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFiltering ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <h3 className="text-lg font-semibold text-[#0E1C29]">
                    Filtering schools...
                  </h3>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-[#0E1C29]">
                    {filteredSchools.length > 0
                      ? `${filteredSchools.length} School${filteredSchools.length !== 1 ? "s" : ""} Found`
                      : "This school is not in our database yet. We are adding more schools weekly."}
                  </h3>
                  {(budgetFilter ||
                    cityFilter ||
                    curriculumFilter ||
                    filteredSchools.length > 0) && (
                    <div className="w-2 h-2 bg-[#774BE5] rounded-full animate-pulse"></div>
                  )}
                </>
              )}
            </div>
            {!isFiltering && (
              <div className="text-sm text-gray-500">
                Showing {displayedSchools.length} of {filteredSchools.length}
              </div>
            )}
          </div>
        </div>

        {isFiltering ? (
          <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5 z-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <SchoolCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#774BE5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-search-line text-[#774BE5] text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-[#0E1C29] mb-2">
              No schools found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery.trim()
                ? "This school is not in our database yet. We are adding more schools weekly."
                : "This school is not in our database yet. We are adding more schools weekly.weekly."}
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setBudgetFilter("");
                setCityFilter("");
                setCurriculumFilter("");
                setLocalSearchQuery("");
                window.history.replaceState({}, "", "/directory");
              }}
              className="bg-[#774BE5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#774BE5]/90 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5 z-0">
            {displayedSchools.map((school, index) => (
              <div key={`${school.school_name}-${index}`}>
                <SchoolCard
                  imageSrc={school.logo_banner}
                  imageAlt={school.school_name}
                  schoolName={school.school_name}
                  location={school.city}
                  tags={school.curriculum_tags.split(", ")}
                  priceRange={`${school.min_tuition} - ${school.max_tuition}`}
                  schoolSlug={createSlug(school.school_name)}
                  priority={index < 6}
                />
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator and intersection observer */}
        <div ref={observerRef}>
          {isLoading && (
            <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <SchoolCardSkeleton key={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

// Loading component for Suspense fallback
const DirectoryLoading = () => (
  <>
    <Navbar />
    <section className="w-full md:px-10 px-5 pt-25 bg-white">
      <h2 className="text-[#0E1C29] md:text-[56px] text-4xl font-normal text-center">
        Explore Preschools
      </h2>
      <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-5 mt-11">
        {Array.from({ length: 6 }).map((_, index) => (
          <SchoolCardSkeleton key={index} />
        ))}
      </div>
    </section>
    <Footer />
  </>
);

// Main component with Suspense boundary
const SchoolDirectory = () => {
  return (
    <Suspense fallback={<DirectoryLoading />}>
      <SchoolDirectoryContent />
    </Suspense>
  );
};

export default SchoolDirectory;
