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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Fetch school data to get the actual school name for title
    const { data: schools, error } = await supabaseServer
      .from("schools")
      .select("school_name, city, min_tuition, max_tuition, curriculum_type, logo_banner, description")
      .order("school_name");

    if (!error && schools) {
      const school = schools.find((s) => createSlug(s.school_name) === slug);

      if (school) {
        const pageUrl = `${baseUrl}/directory/${slug}/`;
        
        // Clean, concise description for sharing
        const buildDescription = () => {
          const parts: string[] = [];
          
          if (school.city) {
            parts.push(school.city);
          }
          
          if (school.curriculum_type) {
            parts.push(school.curriculum_type);
          }
          
          if (school.min_tuition && school.max_tuition) {
            parts.push(`₱${school.min_tuition} - ₱${school.max_tuition}/year`);
          }
          
          return parts.length > 0 
            ? `${school.school_name} • ${parts.join(" • ")}`
            : school.school_name;
        };
        
        const ogDescription = buildDescription();
        const metaDescription = school.description || 
          `View ${school.school_name} on Aralya. ${school.city ? `Located in ${school.city}.` : ""} Compare tuition, curriculum, and contact information.`;
        
        const imageUrl = school.logo_banner 
          ? (school.logo_banner.startsWith('http') ? school.logo_banner : `${baseUrl}${school.logo_banner}`)
          : `${baseUrl}/images/Logo.png`;

        return {
          title: `${school.school_name} | Aralya - Compare Preschools in Metro Manila`,
          description: metaDescription,
          alternates: {
            canonical: pageUrl,
          },
          openGraph: {
            title: school.school_name,
            description: ogDescription,
            url: pageUrl,
            siteName: "Aralya",
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: school.school_name,
              },
            ],
            locale: "en_US",
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: school.school_name,
            description: ogDescription,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata for school page:", error);
  }

  // Fallback metadata
  const pageUrl = `${baseUrl}/directory/${slug}/`;
  const fallbackImage = `${baseUrl}/images/Logo.png`;
  return {
    title: "School Details | Aralya - Compare Preschools in Metro Manila",
    description:
      "View school details, tuition, curriculum, and contact information on Aralya.",
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: "School Details",
      description: "Compare preschools in Metro Manila on Aralya",
      url: pageUrl,
      siteName: "Aralya",
      images: [
        {
          url: fallbackImage,
          width: 1200,
          height: 630,
          alt: "Aralya - Compare Preschools",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "School Details",
      description: "Compare preschools in Metro Manila on Aralya",
      images: [fallbackImage],
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
