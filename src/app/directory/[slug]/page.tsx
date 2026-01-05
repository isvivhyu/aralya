"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { School } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import Footer from "@/components/Footer";

const SchoolDetails = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Get current page URL for sharing
  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      const url = getShareUrl();
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // Share functions
  const shareToFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    // Facebook will automatically scrape Open Graph tags from the page
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check out ${school?.school_name || "this school"} on Aralya!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(`${school?.school_name || "School"} | Aralya - Compare Preschools`);
    const summary = encodeURIComponent(
      `Check out ${school?.school_name || "this school"} on Aralya. ${school?.city ? `Located in ${school.city}.` : ""} ${school?.curriculum_type ? `Curriculum: ${school.curriculum_type}.` : ""} ${school?.min_tuition && school?.max_tuition ? `Tuition: ${school.min_tuition} - ${school.max_tuition} / year.` : ""}`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, "_blank");
  };

  const shareToWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check out ${school?.school_name || "this school"} on Aralya: ${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToMessenger = () => {
    const url = getShareUrl();
    const text = `Check out ${school?.school_name || "this school"} on Aralya! ${url}`;
    // Use Web Share API which works on mobile and allows sharing to Messenger
    if (navigator.share) {
      navigator.share({
        title: `${school?.school_name || "School"} | Aralya`,
        text: text,
        url: url,
      }).catch((error) => {
        // User cancelled or error occurred
        console.log("Share cancelled or failed:", error);
      });
    } else {
      // Fallback: Copy link and show message, or open messenger.com
      navigator.clipboard.writeText(url).then(() => {
        alert("Link copied! You can now paste it in Messenger.");
      }).catch(() => {
        // If clipboard fails, open messenger.com
        window.open("https://www.messenger.com", "_blank");
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out ${school?.school_name || "this school"} on Aralya`);
    const body = encodeURIComponent(`I found this school on Aralya and thought you might be interested:\n\n${getShareUrl()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Format date to "Month Year" format
  const formatLastUpdated = (dateString?: string): string => {
    if (!dateString) {
      // Fallback to current date if no date provided
      const now = new Date();
      return now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      // Fallback to current date if date parsing fails
      const now = new Date();
      return now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };

  // Load school data from API
  useEffect(() => {
    const loadSchool = async () => {
      try {
        const { apiClient } = await import("@/lib/apiClient");
        const foundSchool = await apiClient.getSchoolBySlug(slug);
        setSchool(foundSchool || null);
      } catch (error) {
        console.error("Error loading school:", error);
        setSchool(null);
      } finally {
        setLoading(false);
      }
    };

    loadSchool();
  }, [slug]);

  // Show loading state
  if (loading) {
    return (
      <section className="w-full bg-[#F9FAFB] flex flex-col items-center pb-40 px-5">
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0">
          <Navbar textColor="black" />
        </div>
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 mt-28">
          {/* Header Skeleton */}
          <div className="rounded-[16px] bg-white p-4 flex md:flex-row flex-col gap-4 md:items-center w-full">
            <SkeletonLoader className="w-80 h-50" />
            <div className="flex flex-col gap-2">
              <SkeletonLoader className="h-8 w-64" />
              <div className="flex items-center my-1">
                <SkeletonLoader className="h-4 w-4 rounded-full mr-2" />
                <SkeletonLoader className="h-4 w-32" />
              </div>
              <SkeletonLoader className="h-8 w-32 rounded-lg" />
            </div>
          </div>

          {/* Contact Section Skeleton */}
          <div className="rounded-[16px] bg-white p-4 mt-6 flex gap-4 items-center w-full">
            <div className="flex flex-col gap-2 w-full">
              <SkeletonLoader className="h-6 w-32" />
              <div className="grid md:grid-cols-4 grid-cols-2 w-full gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonLoader key={index} className="h-10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Overview + Info Skeleton */}
          <div className="flex md:flex-row flex-col items-start w-full gap-8 mt-11">
            {/* Overview Skeleton */}
            <div className="rounded-2xl p-8 w-full bg-white">
              <div className="flex gap-2 items-center -ml-1 mb-4">
                <SkeletonLoader className="h-6 w-6 rounded" />
                <SkeletonLoader className="h-6 w-24" />
              </div>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2 mt-4">
                  <SkeletonLoader className="h-5 w-32" />
                  <SkeletonLoader className="h-4 w-full" />
                </div>
              ))}
            </div>

            {/* School Info Skeleton */}
            <div className="rounded-2xl p-8 w-full bg-white">
              <div className="flex gap-2 items-center -ml-1 mb-4">
                <SkeletonLoader className="h-6 w-6 rounded" />
                <SkeletonLoader className="h-6 w-40" />
              </div>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex gap-4 mt-4">
                  <SkeletonLoader className="h-5 w-5 rounded" />
                  <div className="flex-1">
                    <SkeletonLoader className="h-5 w-32 mb-2" />
                    <SkeletonLoader className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show 404 if school not found
  if (!school) {
    return (
      <section className="w-full bg-[#F9FAFB] flex flex-col items-center pb-40 px-5">
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0">
          <Navbar textColor="black" />
        </div>
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 mt-28">
          <div className="rounded-[16px] bg-white p-8 text-center">
            <h1 className="text-4xl font-bold text-[#0E1C29] mb-4">
              School Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              The school you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/directory"
              className="bg-[#774BE5] text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full bg-[#EFE8FF] flex flex-col items-center pb-40 px-5">
        {/* Navbar */}
        <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0">
          <Navbar textColor="black" />
        </div>

        {/* Main Content */}
        <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 mt-28">
          {/* Back to Directory Button */}
          <div className="w-full mb-4">
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-[#774BE5] hover:text-[#6B3FD6] transition-colors font-medium"
            >
              <i className="ri-arrow-left-line text-lg"></i>
              Back to Directory
            </Link>
          </div>

          {/* Header */}
          <div className="rounded-[16px] bg-white p-4 flex md:flex-row flex-col gap-4 md:items-center w-full">
            <div className="w-full md:w-80 md:h-48 bg-gray-200 border border-gray-200 rounded-[10px] overflow-hidden flex items-center justify-center">
              <Image
                src={school?.logo_banner || "/images/Logo.png"}
                alt={school?.school_name || "School Logo"}
                width={400}
                height={200}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
             <h4 className="text-[#0E1C29] md:text-4xl text-base md:font-medium font-semibold">
                <span>{school?.school_name || "School Name"}</span>
                <span className="relative group inline-block ml-1 -mt-3 align-middle">
                  <i className="ri-verified-badge-fill text-[#774BE5] text-xl md:text-2xl cursor-pointer"></i>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#774BE5] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Verified by Aralya
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-[#774BE5]"></div>
                    </div>
                  </div>
                </span>
              </h4>

              <div 
                className="flex items-center gap-2 cursor-pointer border border-black rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors"
                onClick={() => setShowShareModal(true)}
              >
                  <i className="ri-upload-line text-black text-lg"></i>
                  <p className="text-base font-medium text-black underline">
                    Share
                  </p>
              </div>
             </div>
              <div className="flex items-center my-1 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-line text-[#374151] text-lg"></i>
                  <p className="text-base font-medium text-[#374151]">
                    {school?.city || "City"}
                  </p>
                </div>
                <i className="ri-checkbox-blank-circle-fill text-black text-[6px]"></i>
                <p className="text-sm font-medium text-[#374151]">
                  Updated: {formatLastUpdated(school?.updated_at)}
                </p>
              </div>
              {school?.website && (
                <div className="flex items-center my-1">
                  <i className="ri-global-line text-[#774BE5] text-lg"></i>
                  <a
                    href={school?.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-[#774BE5] hover:underline"
                  >
                    Official website ↗
                  </a>
                </div>
              )}
              <p className="text-[#0E1C29] font-bold text-base">
                {school?.min_tuition || "N/A"} -{" "}
                {school?.max_tuition || "N/A"} / year
              </p>
              {school?.description && (
                <p className="text-sm font-medium text-[#374151]">
                  {school.description}
                </p>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="rounded-[16px] bg-white p-4 mt-6 flex gap-4 items-center w-full">
            <div className="flex flex-col gap-2 w-full">
              <h4 className="text-[#0E1C29] md:text-2xl text-base md:font-medium font-semibold">
                Contact School
              </h4>

              <div className="grid md:grid-cols-4 grid-cols-2 w-full gap-4">
                <Link
                  href={`tel:${(school?.contact_number || "").split(",")[0]?.trim() || ""}`}
                  className="bg-[#774BE5] rounded-lg px-4 py-2"
                >
                  <p className="text-white text-center font-semibold text-sm">
                    Call
                  </p>
                </Link>
                <Link
                  href={`sms:${(school?.contact_number || "").split(",")[0]?.trim() || ""}`}
                  className="bg-[#774BE5] rounded-lg px-4 py-2"
                >
                  <p className="text-white text-center font-semibold text-sm">
                    Text
                  </p>
                </Link>
                <Link
                  href={school?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#774BE5] rounded-lg px-4 py-2"
                >
                  <p className="text-white text-center font-semibold text-sm">
                    Facebook
                  </p>
                </Link>
                <Link
                  href={`mailto:${school?.email || ""}`}
                  className="bg-[#774BE5] rounded-lg px-4 py-2"
                >
                  <p className="text-white text-center font-semibold text-sm">
                    Email
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* Overview + Info */}
          <div className="flex md:flex-row flex-col items-start w-full gap-8 mt-11">
            {/* Overview */}
            <div className="rounded-2xl p-8 w-full bg-white">
              <div className="flex gap-2 items-center -ml-1">
                <i className="ri-book-open-line text-[#0E1C29] md:text-2xl text-xl mt-0.5 ml-1"></i>
                <p className="md:text-2xl text-lg text-[#0E1C29] font-semibold">
                  Overview
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p className="md:text-xl text-base text-[#0E1C29] font-semibold">
                  Curriculum
                </p>
                <p className="text-[#0E1C29] font-normal text-sm">
                  {school?.curriculum_type || "Not specified"}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p className="md:text-xl text-base text-[#0E1C29] font-semibold">
                  Grade Levels
                </p>
                <p className="text-[#0E1C29] font-normal text-sm">
                  {school?.preschool_levels_offered || "Not specified"}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p className="md:text-xl text-base text-[#0E1C29] font-semibold">
                  Class Size
                </p>
                <p className="text-[#0E1C29] font-normal text-sm">
                  {school?.class_size_notes || "Not specified"}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p className="md:text-xl text-base text-[#0E1C29] font-semibold">
                  After-school Care
                </p>
                <p className="text-[#0E1C29] font-normal text-sm">
                  {school?.after_school_cares || "Not specified"}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p className="md:text-xl text-base text-[#0E1C29] font-semibold">
                  Special Education Support
                </p>
                <p className="text-[#0E1C29] font-normal text-sm">
                  {school?.special_education_support || "Not specified"}
                </p>
              </div>
            </div>

            {/* School Info */}
            <div className="rounded-2xl p-8 w-full bg-white">
              <div className="flex gap-2 items-center -ml-1">
                <i className="ri-shield-line text-[#0E1C29] md:text-2xl text-xl mt-0.5 ml-1"></i>
                <p className="md:text-2xl text-lg text-[#0E1C29] font-semibold">
                  School Information
                </p>
              </div>

              {[
                {
                  key: "admission",
                  icon: "ri-book-open-line",
                  title: "Admission Requirements",
                  desc: school?.admission_requirements || "Not specified",
                },
                {
                  key: "tuition",
                  icon: "ri-money-dollar-circle-line",
                  title: "Tuition Notes",
                  desc: school?.tuition_notes || "Not specified",
                },
                {
                  key: "programs",
                  icon: "ri-stack-line",
                  title: "Programs",
                  desc: school?.extra_programs_elective || "Not specified",
                },
                {
                  key: "transportation",
                  icon: "ri-bus-line",
                  title: "Transportation",
                  desc: school?.school_bus_note || "Not specified",
                },
                {
                  key: "scholarships",
                  icon: "ri-graduation-cap-line",
                  title: "Scholarships",
                  desc: school?.scholarships_discounts || "Not specified",
                },
                {
                  key: "curriculum",
                  icon: "ri-book-2-line",
                  title: "Curriculum",
                  desc: school?.curriculum_type || "Not specified",
                },
                {
                  key: "language",
                  icon: "ri-global-line",
                  title: "Language",
                  desc: school?.language_used || "Not specified",
                },
                {
                  key: "accreditations",
                  icon: "ri-award-line",
                  title: "Accreditations",
                  desc: school?.accreditations_affiliations || "Not specified",
                },
              ].map((info) => (
                <div key={info.key} className="mt-4 border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                  <button
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [info.key]: !prev[info.key],
                      }))
                    }
                    className="flex items-center justify-between w-full gap-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <i className={`${info.icon} text-[#774BE5] text-lg shrink-0`}></i>
                      <p className="md:text-xl text-base text-[#0E1C29] font-semibold text-left">
                        {info.title}
                      </p>
                    </div>
                    <i
                      className={`ri-arrow-down-s-line text-[#0E1C29] text-lg transition-transform duration-200 shrink-0 ${
                        expandedItems[info.key] ? "rotate-180" : ""
                      }`}
                    ></i>
                  </button>
                  {expandedItems[info.key] && (
                    <div className="mt-3 ml-9">
                      <p className="text-[#0E1C29] font-normal text-sm">
                        {info.desc}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location (opens Google Maps) */}
          <div className="w-full mt-10 rounded-3xl bg-white p-6 flex flex-col  gap-2">
            <div className="flex gap-2 items-center -ml-1 mb-2">
              <i className="ri-map-pin-line text-[#0E1C29] md:text-2xl text-xl mt-0.5 ml-1"></i>
              <p className="md:text-2xl text-lg text-[#0E1C29] font-semibold">
                Location
              </p>
            </div>
            <p className="text-[#0E1C29] font-normal text-sm">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  school?.location && school.location.trim() !== ""
                    ? `${school.location}, Philippines`
                    : school?.city && school.city.trim() !== ""
                      ? `${school.city}, Philippines`
                      : "Philippines",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#774BE5] hover:underline"
              >
                {school?.location && school.location.trim() !== ""
                  ? school.location
                  : school?.city && school.city.trim() !== ""
                    ? school.city
                    : "Philippines"}{" "}
                ↗
              </a>
            </p>
            <div className="mt-4 flex justify-center md:justify-start">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  school?.location && school.location.trim() !== ""
                    ? `${school.location}, Philippines`
                    : school?.city && school.city.trim() !== ""
                      ? `${school.city}, Philippines`
                      : "Philippines",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#774BE5] rounded-lg px-4 py-2 inline-flex items-center gap-2 text-white font-semibold text-sm"
              >
                <i className="ri-map-pin-line text-white text-base"></i>
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Help Keep Information Accurate Section */}
          <div className="w-full mt-10 rounded-3xl bg-white p-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="shrink-0">
                <i className="ri-lightbulb-line text-[#774BE5] text-2xl"></i>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h4 className="text-[#0E1C29] md:text-xl text-base font-semibold">
                  Help us keep this information accurate
                </h4>
                <p className="text-sm text-[#374151]">
                  If you notice outdated or incorrect details, message us on Facebook and we'll review it promptly.
                </p>
                <Link
                  href="https://web.facebook.com/people/Aralya/61578164295126"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#774BE5] rounded-lg px-4 py-2 w-fit mt-2 flex items-center gap-2 hover:bg-[#6B3FD6] transition-colors"
                >
                  <span className="text-white text-center font-semibold text-sm">
                    Message Aralya on Facebook
                  </span>
                  <i className="ri-arrow-right-line text-white text-sm"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-[#0E1C29]">
                Share this school
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* School Image and Details */}
            <div className="mb-6">
              <div className="w-full h-48 bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                <Image
                  src={school?.logo_banner || "/images/Logo.png"}
                  alt={school?.school_name || "School Logo"}
                  width={400}
                  height={200}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h4 className="text-xl font-semibold text-[#0E1C29] mb-2">
                {school?.school_name || "School Name"}
              </h4>
              <div className="flex flex-col gap-1 text-sm text-[#374151]">
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-line"></i>
                  <span>{school?.city || "City"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-money-dollar-circle-line"></i>
                  <span>
                    {school?.min_tuition || "N/A"} - {school?.max_tuition || "N/A"} / year
                  </span>
                </div>
                {school?.curriculum_type && (
                  <div className="flex items-center gap-2">
                    <i className="ri-book-open-line"></i>
                    <span>{school.curriculum_type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Actions */}
            <div className="space-y-3">
              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="w-full bg-[#774BE5] hover:bg-[#6B3FD6] text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                {linkCopied ? (
                  <>
                    <i className="ri-check-line text-lg"></i>
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <i className="ri-link text-lg"></i>
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* Social Media Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareToFacebook}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-facebook-fill text-[#1877F2] text-xl"></i>
                  <span className="font-medium text-[#0E1C29]">Facebook</span>
                </button>

                <button
                  onClick={shareToTwitter}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-twitter-x-fill text-black text-xl"></i>
                  <span className="font-medium text-[#0E1C29]">Twitter</span>
                </button>

                <button
                  onClick={shareToLinkedIn}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-linkedin-fill text-[#0A66C2] text-xl"></i>
                  <span className="font-medium text-[#0E1C29]">LinkedIn</span>
                </button>

                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-whatsapp-fill text-[#25D366] text-xl"></i>
                  <span className="font-medium text-[#0E1C29]">WhatsApp</span>
                </button>
              </div>

              {/* Messaging Apps */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareToMessenger}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-messenger-fill text-[#0084FF] text-xl"></i>
                  <span className="font-medium text-[#0E1C29]">Messenger</span>
                </button>

                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <i className="ri-mail-line text-[#774BE5] text-xl"></i>
                  <span className="font-medium text-[#0E1C29]">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default SchoolDetails;
