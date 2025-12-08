import { createClient } from '@supabase/supabase-js'

// Używamy zmiennych środowiskowych zamiast wpisywać klucze na sztywno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)