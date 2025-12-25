/**
 * Public API routes for school operations
 * These routes are rate-limited but don't require authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

// GET /api/schools - Get all schools
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const result = rateLimit({
    ...RATE_LIMITS.api,
    identifier: `api-schools:${ip}`,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMITS.api.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const city = searchParams.get("city");
    const curriculum = searchParams.get("curriculum");
    const featured = searchParams.get("featured") === "true";

    let queryBuilder = supabaseServer.from("schools").select("*");

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(
        `school_name.ilike.%${query}%, city.ilike.%${query}%, curriculum_tags.ilike.%${query}%`,
      );
    }

    if (city) {
      // For city filtering, we'll handle it client-side for better matching
      // This is a limitation we keep for now to match existing behavior
      queryBuilder = queryBuilder.ilike("city", `%${city}%`);
    }

    if (curriculum) {
      queryBuilder = queryBuilder.contains("curriculum_tags", curriculum);
    }

    if (featured) {
      queryBuilder = queryBuilder.limit(3);
    }

    queryBuilder = queryBuilder.order("school_name");

    const { data, error } = await queryBuilder;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch schools", details: error.message },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ schools: data || [] });
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS.api.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.reset));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
