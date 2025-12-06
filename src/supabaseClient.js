import { createClient } from '@supabase/supabase-js'

// Twoje dane z Supabase
const supabaseUrl = 'https://jxealqtsvczkmwplfhlh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZWFscXRzdmN6a213cGxmaGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTA2MDksImV4cCI6MjA4MDYyNjYwOX0.ye2KvLnNTvIahSERh4tdehKqNvMofDCQ5LSBM3akyAw'

export const supabase = createClient(supabaseUrl, supabaseKey)