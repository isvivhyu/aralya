/**
 * API Client for making requests to backend endpoints
 */

import { School } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = API_BASE_URL
    ? `${API_BASE_URL}${endpoint}`
    : endpoint; // Use relative URLs if no base URL is set

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new Error(
        `Rate limit exceeded. Please try again after ${retryAfter} seconds.`
      );
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  // Get all schools with optional filters
  getSchools: async (params?: {
    query?: string;
    city?: string;
    curriculum?: string;
    featured?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set("query", params.query);
    if (params?.city) searchParams.set("city", params.city);
    if (params?.curriculum) searchParams.set("curriculum", params.curriculum);
    if (params?.featured) searchParams.set("featured", "true");

    const queryString = searchParams.toString();
    const endpoint = `/api/schools${queryString ? `?${queryString}` : ""}`;
    
    const data = await apiRequest<{ schools: School[] }>(endpoint);
    return data.schools;
  },

  // Get school by slug
  getSchoolBySlug: async (slug: string) => {
    const data = await apiRequest<{ school: School }>(`/api/schools/${slug}`);
    return data.school;
  },

  // Get cities with school counts
  getCities: async (query?: string) => {
    const endpoint = query
      ? `/api/cities?query=${encodeURIComponent(query)}`
      : `/api/cities`;
    
    const data = await apiRequest<{ cities: { city: string; schoolCount: number }[] }>(endpoint);
    return data.cities;
  },
};

