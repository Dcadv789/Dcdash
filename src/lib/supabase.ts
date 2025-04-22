import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmklhqmcfffbufrjbruh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBta2xocW1jZmZmYnVmcmpicnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNjE0NDksImV4cCI6MjA2MDkzNzQ0OX0.J5V0yvILPvoWwKxgWCAUnMmJ1DbwokcsRyvPs7wg8Lk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);