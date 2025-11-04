import { supabase, School, City } from "./supabase";

export class SchoolService {
  // Get all schools
  static async getAllSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("school_name");

    if (error) {
      console.error("Error fetching schools:", error);
      throw error;
    }

    return data || [];
  }

  // Get school by ID
  static async getSchoolById(id: number): Promise<School | null> {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching school:", error);
      return null;
    }

    return data;
  }

  // Search schools
  static async searchSchools(query: string): Promise<School[]> {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .or(
        `school_name.ilike.%${query}%, city.ilike.%${query}%, curriculum_tags.ilike.%${query}%`,
      )
      .order("school_name");

    if (error) {
      console.error("Error searching schools:", error);
      throw error;
    }

    return data || [];
  }

  // Get schools by city (case-insensitive, handles comma-separated cities and variations)
  static async getSchoolsByCity(city: string): Promise<School[]> {
    if (!city || city.trim() === "") {
      return [];
    }

    const searchCity = city.trim().toLowerCase();

    // Fetch all schools and filter in JavaScript to handle comma-separated cities and variations
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("school_name");

    if (error) {
      console.error("Error fetching schools by city:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Filter schools where the city field contains the search city
    // Handle comma-separated cities by splitting and comparing lowercase
    const filtered = data.filter((school) => {
      if (!school.city) return false;

      // Split by comma and trim each city
      const cities = school.city
        .split(",")
        .map((c: string) => c.trim().toLowerCase());

      // Check if any city matches (case-insensitive, handles variations like "Pasig" vs "Pasig City")
      return cities.some((c: string) => this.citiesMatch(searchCity, c));
    });

    return filtered;
  }

  // Get schools by curriculum
  static async getSchoolsByCurriculum(curriculum: string): Promise<School[]> {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .contains("curriculum_tags", curriculum)
      .order("school_name");

    if (error) {
      console.error("Error fetching schools by curriculum:", error);
      throw error;
    }

    return data || [];
  }

  // Add new school
  static async addSchool(
    school: Omit<School, "id" | "created_at" | "updated_at">,
  ): Promise<School> {
    const { data, error } = await supabase
      .from("schools")
      .insert([school])
      .select()
      .single();

    if (error) {
      console.error("Error adding school:", error);
      throw error;
    }

    return data;
  }

  // Update school
  static async updateSchool(
    id: number,
    updates: Partial<School>,
  ): Promise<School> {
    const { data, error } = await supabase
      .from("schools")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating school:", error);
      throw error;
    }

    return data;
  }

  // Delete school
  static async deleteSchool(id: number): Promise<void> {
    const { error } = await supabase.from("schools").delete().eq("id", id);

    if (error) {
      console.error("Error deleting school:", error);
      throw error;
    }
  }

  // Get featured schools (first 3)
  static async getFeaturedSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("school_name")
      .limit(3);

    if (error) {
      console.error("Error fetching featured schools:", error);
      throw error;
    }

    return data || [];
  }

  // Get unique cities
  static async getUniqueCities(): Promise<string[]> {
    const { data, error } = await supabase
      .from("schools")
      .select("city")
      .order("city");

    if (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }

    // Extract unique cities
    const uniqueCities = [...new Set(data?.map((item) => item.city) || [])];
    return uniqueCities;
  }

  // Get unique curriculum tags
  static async getUniqueCurriculumTags(): Promise<string[]> {
    const { data, error } = await supabase
      .from("schools")
      .select("curriculum_tags");

    if (error) {
      console.error("Error fetching curriculum tags:", error);
      throw error;
    }

    // Extract and flatten all curriculum tags
    const allTags =
      data?.flatMap(
        (item) =>
          item.curriculum_tags?.split(", ").map((tag: string) => tag.trim()) ||
          [],
      ) || [];

    return [...new Set(allTags)].sort();
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

    const searchCity = city.trim().toLowerCase();

    // Fetch all schools and filter in JavaScript to handle comma-separated cities
    // This is more reliable than trying to match with SQL patterns
    const { data, error } = await supabase.from("schools").select("city");

    if (error) {
      console.error(
        "Error getting school count by city:",
        error,
        "for city:",
        city,
      );
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Count schools where the city field contains the search city
    // Handle comma-separated cities by splitting and comparing lowercase
    const count = data.filter((school) => {
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
  }

  // Search cities by query with school counts - fetches ONLY from cities table
  static async searchCities(
    query: string,
  ): Promise<{ city: string; schoolCount: number }[]> {
    let queryBuilder = supabase.from("cities").select("*");

    // If query is provided, filter by city name
    if (query.trim().length > 0) {
      queryBuilder = queryBuilder.ilike("city", `%${query.trim()}%`);
    } else {
      queryBuilder = queryBuilder.order("city", { ascending: true });
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Error querying cities table:", error);
      throw error;
    }

    console.log(
      `Successfully fetched ${data?.length || 0} cities from cities table`,
    );
    return this.processCitiesData(data, "city");
  }

  // Helper method to process cities data
  private static async processCitiesData(
    data: City[] | null,
    _cityColumnName: string,
  ): Promise<{ city: string; schoolCount: number }[]> {
    if (!data || data.length === 0) {
      console.log("No cities data returned from cities table");
      return [];
    }

    console.log(
      `Processing ${data.length} cities from cities table. Sample record:`,
      data[0],
    );

    const citiesWithCounts = await Promise.all(
      data.map(async (cityRecord: City) => {
        const cityName = cityRecord.city || "";

        // Always calculate the actual school count from the schools table
        // This ensures accuracy even if the cached count in cities table is outdated
        const schoolCount = cityName
          ? await this.getSchoolCountByCity(cityName)
          : 0;

        return {
          city: cityName,
          schoolCount,
        };
      }),
    );

    console.log(`Processed ${citiesWithCounts.length} cities`);
    return citiesWithCounts;
  }

  // Fallback method: search cities from schools table (for backward compatibility)
  private static async searchCitiesFromSchools(
    query: string,
  ): Promise<{ city: string; schoolCount: number }[]> {
    if (query.trim().length === 0) {
      const cities = await this.getUniqueCities();
      const citiesWithCounts = await Promise.all(
        cities.map(async (city) => ({
          city,
          schoolCount: await this.getSchoolCountByCity(city),
        })),
      );
      return citiesWithCounts;
    }

    const { data, error } = await supabase
      .from("schools")
      .select("city")
      .ilike("city", `%${query}%`)
      .order("city");

    if (error) {
      console.error("Error searching cities:", error);
      throw error;
    }

    // Extract unique cities from results
    const uniqueCities = [...new Set(data?.map((item) => item.city) || [])];

    // Get school counts for each city
    const citiesWithCounts = await Promise.all(
      uniqueCities.map(async (city) => ({
        city,
        schoolCount: await this.getSchoolCountByCity(city),
      })),
    );

    return citiesWithCounts;
  }
}
