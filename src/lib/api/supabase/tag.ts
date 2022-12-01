import { supabase } from './client'

import type { Database } from '~supabase/database.types'

export type Tag = Database['public']['Tables']['tags']

export class TagApi {
    public async post(tags: string[]) {
        const { error } = await supabase.from('tags').upsert(
            tags.map((name) => ({ name })),
            { ignoreDuplicates: true },
        )
        if (error) throw error
    }

    public async use(tags: string[]) {
        if (tags.length < 1) return
        const exists = await supabase
            .from('tags')
            .select('*')
            .or(tags.map((v) => `name.eq.${v}`).join(','))
        if (exists.error) throw exists.error
        const filtered = tags.filter((v) => exists.data.findIndex((v2) => v2.name === v) === -1)

        await Promise.all([
            this.post(filtered),
            exists.data.map((tag: Tag['Row']) =>
                supabase
                    .from('tags')
                    .update({
                        used: tag.used + 1,
                    })
                    .eq('name', tag.name),
            ),
        ])
    }

    public async search(txt: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .like('name', `%${txt}%`)
            .order('used', { ascending: false })
            .limit(10)
        if (error) throw error
        return data.map((v) => v.name)
    }
}
