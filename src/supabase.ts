import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = 'https://dfjldryrvjyllhxnurvj.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmamxkcnlydmp5bGxoeG51cnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTkzNTUsImV4cCI6MjA3NDI5NTM1NX0._8ump1rdet4RqRcGO6nJtur5kP939wcli7ZwFwzczOo'

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    