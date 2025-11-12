import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Get these from your Supabase project: https://supabase.com/dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || supabaseUrl === 'your-project-url-here' || !supabaseUrl.startsWith('http')) {
  console.error('❌ Invalid Supabase URL. Please update your .env file with your actual Supabase project URL.');
  console.error('Get it from: https://supabase.com/dashboard → Settings → API');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.error('❌ Invalid Supabase key. Please update your .env file with your actual Supabase anon key.');
  console.error('Get it from: https://supabase.com/dashboard → Settings → API');
}

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your-project-url-here' || 
    supabaseAnonKey === 'your-anon-key-here' ||
    !supabaseUrl.startsWith('http')) {
  throw new Error(
    'Missing or invalid Supabase configuration. ' +
    'Please update your .env file with your Supabase credentials. ' +
    'See SUPABASE_SETUP.md for instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

