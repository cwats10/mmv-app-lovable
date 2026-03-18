import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pcsdjwtzmluiafsakocf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjc2Rqd3R6bWx1aWFmc2Frb2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDg3NjcsImV4cCI6MjA4OTM4NDc2N30.XwF-QhscTrMv1rFPXT1DBxDxrCOEAfCkVACUIeQouMM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
