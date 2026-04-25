import { createClient } from "@supabase/supabase-js";

const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseProjectUrl, supabasePublicAnonKey);
