"use client";

import Navbar from "@/components/Navbar";
import HowItWorksSection from "@/components/HowItWorksSection";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import { ButtonWithLoading } from "@/components/LoadingSpinner";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "city" | "budget" | "curriculum"
  >("all");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search functionality
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      if (searchQuery.trim()) {
        // Redirect to directory with search query
        router.push(
          `/directory?search=${encodeURIComponent(searchQuery.trim())}`,
        );
      } else {
        // If no search query, go to directory
        router.push("/directory");
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      // Reset loading state after a short delay to allow navigation
      setTimeout(() => setIsSearching(false), 500);
    }
  };

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

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

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

  return (
    <>
      <section
        className="w-full min-h-screen bg-cover bg-center flex flex-col items-center pb-40 px-5"
        style={{ backgroundImage: "url('/images/Hero.jpg')" }}
      >
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0 z-[1000]">
          <Navbar />
        </div>
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 md:px-0 mt-40 z-1">
          <h1 className="md:text-7xl text-[32px] font-semibold text-white text-center leading-[120%]">
            Find the Right Preschool
          </h1>

          <form
            id="search-form-mobile"
            onSubmit={handleSearch}
            className="bg-white w-full p-5 rounded-3xl mt-6 relative"
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
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={getPlaceholder()}
                  className="bg-transparent w-full text-base text-[#0E1C29] placeholder-[#999999] focus:outline-none"
                  style={{ fontSize: "16px" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
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
        </div>
        <div className="w-full h-full absolute bg-black/20 z-0"></div>
      </section>

      <section className="w-full md:px-10 px-5 pt-25 bg-white">
        <h2 className="text-[#0E1C29] md:text-[56px] text-4xl font-normal text-center">
          Why parents use Aralya
        </h2>
        <div className="w-full md:w-[800px] mx-auto">
          <p className="mt-4 text-[#0E1C29] text-sm text-center font-normal">
            Carefully curated preschool information to help parents choose with confidence.
          </p>
        </div>
        <div className="mt-11 mb-25 flex items-center justify-center w-full">
          <div className="w-fit">
            <Link
              href="/directory"
              className="bg-black hover:bg-[#774BE5] transition-all duration-500 ease-in-out rounded-[10px] text-white flex items-center gap-2 px-6 py-3"
            >
              <p className="text-base font-medium">Browse preschools</p>
              <i className="ri-arrow-right-fill text-lg"></i>
            </Link>
          </div>
        </div>
      </section>

      <div>
        <HowItWorksSection
          title="Getting started with Aralya"
          steps={[
            {
              iconClass: "ri-school-line",
              text: (
                <>
                  <strong>Start</strong> with available preschools
                </>
              ),
            },
            {
              iconClass: "ri-filter-line",
              text: (
                <>
                  <strong>Narrow down</strong> what matters to you
                </>
              ),
            },
            {
              iconClass: "ri-file-text-line",
              text: (
                <>
                  <strong>Review</strong> details and reach out when ready
                </>
              ),
            },
          ]}
        />
      </div>

      <Footer />
    </>
  );
}
