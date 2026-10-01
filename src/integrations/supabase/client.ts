import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Each LexCollect deployment points at its own Supabase project. Set these in `.env.local`
// for development and in the hosting provider's environment settings for production
// (see `.env.example`).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'LexCollect is missing its Supabase settings. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).',
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
