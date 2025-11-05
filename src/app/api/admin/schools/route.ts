/**
 * API route for admin school operations
 * This route requires authentication (add your auth logic here)
 * Uses server-side Supabase client with service role key
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { School } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

// GET /api/admin/schools - Get all schools (admin only)
export async function GET(request: NextRequest) {
  // Apply rate limiting first
  const ip = getClientIP(request);
  const rateLimitResult = rateLimit({
    ...RATE_LIMITS.api,
    identifier: `admin-api:${ip}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMITS.api.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabaseServer
      .from("schools")
      .select("*")
      .order("school_name");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch schools", details: error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ schools: data || [] });
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS.api.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/schools - Create a new school
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitResult = rateLimit({
    ...RATE_LIMITS.api,
    identifier: `admin-api:${ip}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMITS.api.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const school: Omit<School, "id" | "created_at" | "updated_at"> =
      await request.json();

    const { data, error } = await supabaseServer
      .from("schools")
      .insert([school])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create school", details: error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ school: data }, { status: 201 });
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS.api.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// PUT /api/admin/schools - Update a school
export async function PUT(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIP(request);
  const rateLimitResult = rateLimit({
    ...RATE_LIMITS.api,
    identifier: `admin-api:${ip}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMITS.api.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id, ...schoolData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("schools")
      .update(schoolData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update school", details: error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ school: data });
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS.api.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
    return response;
  } catch (_error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

