import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aralya.com";

// Helper function to create URL-friendly slugs (same as used in the app)
function createSlug(schoolName: string): string {
  return schoolName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  try {
    // Fetch school data to get the actual school name for title
    const { data: schools, error } = await supabaseServer
      .from("schools")
      .select("school_name")
      .order("school_name");

    if (!error && schools) {
      const school = schools.find((s) => createSlug(s.school_name) === slug);

      if (school) {
        return {
          title: `${school.school_name} | Aralya - Compare Preschools in Metro Manila`,
          description: `View details, tuition, curriculum, and contact information for ${school.school_name} on Aralya.`,
          alternates: {
            canonical: `${baseUrl}/directory/${slug}/`,
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata for school page:", error);
  }

  // Fallback metadata
  return {
    title: "School Details | Aralya - Compare Preschools in Metro Manila",
    description:
      "View school details, tuition, curriculum, and contact information on Aralya.",
    alternates: {
      canonical: `${baseUrl}/directory/${slug}/`,
    },
  };
}

export default function SchoolDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
