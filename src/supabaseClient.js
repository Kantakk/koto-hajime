import { createClient } from '@supabase/supabase-js'

// 先ほどメモしたURLとKeyに書き換えてください
const supabaseUrl = 'https://meaxxvqadupxfdponuzc.supabase.co'
const supabaseAnonKey = 'sb_publishable_O8GYEB5OMWq0L5mg4G9VZA_ZcFvYLz_'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)