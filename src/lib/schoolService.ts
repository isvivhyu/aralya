import { School } from "./supabase";
import { apiClient } from "./apiClient";

export class SchoolService {
  // Get all schools
  static async getAllSchools(): Promise<School[]> {
    try {
      return await apiClient.getSchools();
    } catch (error) {
      console.error("Error fetching schools:", error);
      throw error;
    }
  }

  // Get school by ID (deprecated - use getSchoolBySlug instead)
  static async getSchoolById(id: number): Promise<School | null> {
    // For backward compatibility, we'll need to fetch all and find by ID
    // Consider migrating to slug-based lookups
    try {
      const schools = await apiClient.getSchools();
      return schools.find((s) => s.id === id) || null;
    } catch (error) {
      console.error("Error fetching school by ID:", error);
      return null;
    }
  }

  // Search schools
  static async searchSchools(query: string): Promise<School[]> {
    try {
      return await apiClient.getSchools({ query });
    } catch (error) {
      console.error("Error searching schools:", error);
      throw error;
    }
  }

  // Get schools by city (case-insensitive, handles comma-separated cities and variations)
  static async getSchoolsByCity(city: string): Promise<School[]> {
    if (!city || city.trim() === "") {
      return [];
    }

    const searchCity = city.trim().toLowerCase();

    try {
      // Fetch all schools from API and filter client-side to handle comma-separated cities
      const schools = await apiClient.getSchools({ city });

      if (!schools || schools.length === 0) {
        return [];
      }

      // Filter schools where the city field contains the search city
      // Handle comma-separated cities by splitting and comparing lowercase
      const filtered = schools.filter((school) => {
        if (!school.city) return false;

        // Split by comma and trim each city
        const cities = school.city
          .split(",")
          .map((c: string) => c.trim().toLowerCase());

        // Check if any city matches (case-insensitive, handles variations like "Pasig" vs "Pasig City")
        return cities.some((c: string) => this.citiesMatch(searchCity, c));
      });

      return filtered;
    } catch (error) {
      console.error("Error fetching schools by city:", error);
      throw error;
    }
  }

  // Get schools by curriculum
  static async getSchoolsByCurriculum(curriculum: string): Promise<School[]> {
    try {
      return await apiClient.getSchools({ curriculum });
    } catch (error) {
      console.error("Error fetching schools by curriculum:", error);
      throw error;
    }
  }

  // Add new school (admin only - uses admin API)
  static async addSchool(
    school: Omit<School, "id" | "created_at" | "updated_at">,
  ): Promise<School> {
    try {
      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if needed
          // "Authorization": `Bearer ${adminApiKey}`
        },
        body: JSON.stringify(school),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add school");
      }

      const data = await response.json();
      return data.school;
    } catch (error) {
      console.error("Error adding school:", error);
      throw error;
    }
  }

  // Update school (admin only - uses admin API)
  static async updateSchool(
    id: number,
    updates: Partial<School>,
  ): Promise<School> {
    try {
      const response = await fetch("/api/admin/schools", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if needed
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update school");
      }

      const data = await response.json();
      return data.school;
    } catch (error) {
      console.error("Error updating school:", error);
      throw error;
    }
  }

  // Delete school (admin only - uses admin API)
  static async deleteSchool(id: number): Promise<void> {
    try {
      const response = await fetch(`/api/admin/schools/${id}`, {
        method: "DELETE",
        headers: {
          // Add authentication header if needed
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete school");
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      throw error;
    }
  }

  // Get featured schools (first 3)
  static async getFeaturedSchools(): Promise<School[]> {
    try {
      return await apiClient.getSchools({ featured: true });
    } catch (error) {
      console.error("Error fetching featured schools:", error);
      throw error;
    }
  }

  // Get unique cities
  static async getUniqueCities(): Promise<string[]> {
    try {
      const cities = await apiClient.getCities();
      return cities.map((c) => c.city);
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  }

  // Get unique curriculum tags
  static async getUniqueCurriculumTags(): Promise<string[]> {
    try {
      const schools = await apiClient.getSchools();

      // Extract and flatten all curriculum tags
      const allTags =
        schools?.flatMap(
          (item) =>
            item.curriculum_tags
              ?.split(", ")
              .map((tag: string) => tag.trim()) || [],
        ) || [];

      return [...new Set(allTags)].sort();
    } catch (error) {
      console.error("Error fetching curriculum tags:", error);
      throw error;
    }
  }

  // Helper function to check if two city names match (handles variations like "Pasig" vs "Pasig City")
  // Made public so it can be used in other components
  static citiesMatch(searchCity: string, schoolCity: string): boolean {
    // Exact match
    if (searchCity === schoolCity) return true;

    // Check if one starts with the other (handles "Pasig" vs "Pasig City")
    // Remove common suffixes like "City" for more flexible matching
    const normalize = (cityName: string) => {
      return cityName
        .replace(/\s+city\s*$/i, "") // Remove " City" at the end
        .replace(/\s+metro\s*$/i, "") // Remove " Metro" at the end
        .trim();
    };

    const normalizedSearch = normalize(searchCity);
    const normalizedSchool = normalize(schoolCity);

    // Exact match after normalization
    if (normalizedSearch === normalizedSchool) return true;

    // Check if one is a prefix of the other (handles "Pasig" matching "Pasig City")
    if (
      normalizedSchool.startsWith(normalizedSearch + " ") ||
      normalizedSearch.startsWith(normalizedSchool + " ")
    ) {
      return true;
    }

    return false;
  }

  // Get school count by city (case-insensitive, handles comma-separated cities and variations)
  static async getSchoolCountByCity(city: string): Promise<number> {
    if (!city || city.trim() === "") {
      return 0;
    }

    try {
      // Fetch all schools from API and filter in JavaScript to handle comma-separated cities
      const schools = await apiClient.getSchools();

      if (!schools || schools.length === 0) {
        return 0;
      }

      const searchCity = city.trim().toLowerCase();

      // Count schools where the city field contains the search city
      // Handle comma-separated cities by splitting and comparing lowercase
      const count = schools.filter((school) => {
        if (!school.city) return false;

        // Split by comma and trim each city
        const cities = school.city
          .split(",")
          .map((c: string) => c.trim().toLowerCase());

        // Check if any city matches (case-insensitive, handles variations like "Pasig" vs "Pasig City")
        return cities.some((c: string) => this.citiesMatch(searchCity, c));
      }).length;

      console.log(`School count for "${city}": ${count}`);
      return count;
    } catch (error) {
      console.error(
        "Error getting school count by city:",
        error,
        "for city:",
        city,
      );
      throw error;
    }
  }

  // Search cities by query with school counts - uses API endpoint
  static async searchCities(
    query: string,
  ): Promise<{ city: string; schoolCount: number }[]> {
    try {
      return await apiClient.getCities(query);
    } catch (error) {
      console.error("Error searching cities:", error);
      throw error;
    }
  }
}
