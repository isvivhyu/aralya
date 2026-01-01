import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface School {
  id?: number;
  school_name: string;
  min_tuition: string;
  max_tuition: string;
  tuition_notes: string;
  grade_levels_offered: string;
  class_size_notes: string;
  curriculum_type: string;
  class_schedule: string;
  extra_programs_elective: string;
  after_school_cares: string;
  admission_requirements: string;
  scholarships_discounts: string;
  special_education_support: string;
  language_used: string;
  school_bus_note: string;
  accreditations_affiliations: string;
  logo_banner: string;
  website: string;
  facebook: string;
  contact_number: string;
  email: string;
  city: string;
  preschool_levels_offered: string;
  curriculum_tags: string;
  created_at?: string;
  updated_at?: string;
  location?: string;
  description?: string;
}

export interface City {
  id?: number;
  city: string;
  school_count?: number;
  created_at?: string;
  updated_at?: string;
}
