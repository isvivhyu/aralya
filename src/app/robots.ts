import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aralya.com";

  return {
    rules: [
      // Allow major search + social preview bots
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "AdsBot-Google",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "bingbot",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "FacebookExternalHit",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "Twitterbot",
        allow: "/",
        disallow: [],
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
        disallow: [],
      },
      // Everything else: do not crawl
      {
        userAgent: "*",
        allow: [],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
