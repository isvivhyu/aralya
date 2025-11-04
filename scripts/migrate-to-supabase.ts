import { createClient } from "@supabase/supabase-js";
import { schoolsData } from "../src/utils/data";
import { config } from "dotenv";
import path from "path";

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables!");
  console.error(
    "Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSchoolsData() {
  console.log("Starting migration of schools data to Supabase...");

  try {
    // First, let's check if there are existing schools
    const { data: existingSchools, error: checkError } = await supabase
      .from("schools")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("Error checking existing schools:", checkError);
      return;
    }

    if (existingSchools && existingSchools.length > 0) {
      console.log("Schools already exist in the database. Skipping migration.");
      console.log(
        "If you want to re-migrate, please clear the schools table first.",
      );
      return;
    }

    // Insert all schools data in batches to avoid timeout
    const batchSize = 10;
    const totalSchools = schoolsData.length;
    let migratedCount = 0;

    for (let i = 0; i < totalSchools; i += batchSize) {
      const batch = schoolsData.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("schools")
        .insert(batch)
        .select();

      if (error) {
        console.error(
          `Error migrating batch ${Math.floor(i / batchSize) + 1}:`,
          error,
        );
        return;
      }

      migratedCount += data?.length || 0;
      console.log(`Migrated ${migratedCount}/${totalSchools} schools...`);
    }

    console.log(`Successfully migrated ${migratedCount} schools to Supabase!`);
    console.log("You can now view and manage your data in Supabase Studio.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateSchoolsData();
}

export { migrateSchoolsData };
