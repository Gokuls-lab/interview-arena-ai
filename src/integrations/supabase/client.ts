
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://prjqjitgfunnwqacnkew.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByanFqaXRnZnVubndxYWNua2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxODY3MzIsImV4cCI6MjA1OTc2MjczMn0.bKE7JWxj5RKShoMyyFI3qt6thdTTURMjQhC5P2mUGSA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
