import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucijquhbkxqycyajkjfa.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaWpxdWhia3hxeWN5YWpramZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzc5OTEsImV4cCI6MjA5NDYxMzk5MX0.kHBmx7t70dUFqXlT9980S80e9z8pcw-mGMnVSMxymN8i'

export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseKey)
}