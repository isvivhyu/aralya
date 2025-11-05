/**
 * Public API route for city operations
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

// GET /api/cities - Get cities with school counts
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const result = rateLimit({
    ...RATE_LIMITS.search,
    identifier: `api-cities:${ip}`,
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
          "X-RateLimit-Limit": String(RATE_LIMITS.search.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    let queryBuilder = supabaseServer.from("cities").select("*");

    if (query && query.trim().length > 0) {
      queryBuilder = queryBuilder.ilike("city", `%${query.trim()}%`);
    } else {
      queryBuilder = queryBuilder.order("city", { ascending: true });
    }

    const { data, error } = await queryBuilder;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch cities", details: error.message },
        { status: 500 }
      );
    }

    // Get school counts for each city
    const citiesWithCounts = await Promise.all(
      (data || []).map(async (cityRecord) => {
        const cityName = cityRecord.city || "";
        
        // Count schools in this city
        const { count } = await supabaseServer
          .from("schools")
          .select("*", { count: "exact", head: true })
          .ilike("city", `%${cityName}%`);

        return {
          city: cityName,
          schoolCount: count || 0,
        };
      })
    );

    const response = NextResponse.json({ cities: citiesWithCounts });
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS.search.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.reset));
    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

