import { MetadataRoute } from "next";
import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { School } from "@/lib/supabase";

// Helper function to create URL-friendly slugs (same as used in the app)
function createSlug(schoolName: string): string {
  return schoolName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

// Cache the school data fetching to reduce database load
// Use server-side Supabase client directly since sitemap runs server-side
const getCachedSchools = cache(async (): Promise<School[]> => {
  try {
    const { data, error } = await supabaseServer
      .from("schools")
      .select("*")
      .order("school_name");

    if (error) {
      console.error("Error fetching schools for sitemap:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching schools for sitemap:", error);
    return [];
  }
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aralya.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-services`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Dynamic school pages - cached to reduce database queries
  const schools = await getCachedSchools();
  const schoolPages: MetadataRoute.Sitemap = schools.map((school) => ({
    url: `${baseUrl}/directory/${createSlug(school.school_name)}`,
    lastModified: school.updated_at
      ? new Date(school.updated_at)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...schoolPages];
}

