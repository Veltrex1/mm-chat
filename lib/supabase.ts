import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatResponse {
  id?: string;
  name: string;
  email: string;
  relationship_status: string;
  biggest_goal: string;
  created_at?: string;
}



