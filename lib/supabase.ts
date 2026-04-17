import { createClient } from "@supabase/supabase-js";

// Safe fallback for Next.js mock environment if not configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJmock";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
