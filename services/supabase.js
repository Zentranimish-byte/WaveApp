import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://axbxwtecnfyozkxjxjdr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Ynh3dGVjbmZ5b3preGp4amRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjQ4MTQsImV4cCI6MjA5NDEwMDgxNH0.4yvAZUUWdCKsGWai7m-F4GYFcfwPQJTPBKDLdy8HGdc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});