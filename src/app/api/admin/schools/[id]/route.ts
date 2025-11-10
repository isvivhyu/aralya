/**
 * API route for individual school operations
 * DELETE /api/admin/schools/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { isAuthenticated } from "@/lib/auth";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rateLimit";

// DELETE /api/admin/schools/[id] - Delete a school
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const schoolId = parseInt(id);
    
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { error: "Invalid school ID" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("schools")
      .delete()
      .eq("id", schoolId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete school", details: error.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMITS.api.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

