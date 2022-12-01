import { supabase } from './client'

import type { Database } from '~supabase/database.types'

export type MutedUser = Database['public']['Tables']['muted_users']

export class Mute {
    public async add(target: string, author: string) {
        const { error } = await supabase.from('muted_users').insert({
            author,
            target,
        })
        if (error) throw error
    }

    public async remove(target: string) {
        const { error } = await supabase.from('muted_users').delete().eq('target', target)
        if (error) throw error
    }

    public async list(author: string): Promise<MutedUser['Row'][]> {
        const { data, error } = await supabase.from('muted_users').select('*').eq('author', author)
        if (error) throw error
        return data
    }
}
