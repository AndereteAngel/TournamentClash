import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pmhqiiklewbugsrizdmk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaHFpaWtsZXdidWdzcml6ZG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODkwODcsImV4cCI6MjA5Nzg2NTA4N30.ehlYNLiMt_1fY0eCBkDC-X9edISKH7Ua9Cn0qQE8c1c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
})