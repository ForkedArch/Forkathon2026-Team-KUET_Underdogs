import { createClient } from "@supabase/supabase-js";

// Just the structure. will add keys later

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);