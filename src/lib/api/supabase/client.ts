import { createClient } from '@supabase/supabase-js'

import type { Database } from '~supabase/database.types'

export const createSupabaseInstance = () =>
    createClient<Database>(
        import.meta.env['VITE_SUPABASE_URL'],
        import.meta.env['VITE_SUPABASE_ANON_KEY'],
    )

export const supabase = createSupabaseInstance()
