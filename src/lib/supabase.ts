import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucijquhbkxqycyajkjfa.supabase.co'
const supabaseKey = 'sb_publishable_jYBG5ntQmyxdGHxy9YN2GQ_BLJr03gD'

export function createClient() {
    return createSupabaseClient(supabaseUrl, supabaseKey)
}