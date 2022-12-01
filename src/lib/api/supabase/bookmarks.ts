import { supabase } from './client'

import type { Database } from '~supabase/database.types'

export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
type Filter = {
    targets: number[]
    author: string
    limit: number
    since: number
}

const TABLE_NAME = 'bookmarks'

export class BookmarkApi {
    public async create(target: number) {
        const { error } = await supabase.from(TABLE_NAME).insert({
            target,
        })
        if (error) throw error
        return
    }

    public async remove(target: number, author: string) {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('target', target)
            .eq('author', author)
        if (error) throw error
        return
    }

    private createBuilder(filter?: Partial<Filter>, count?: 'exact') {
        const options: Required<Parameters<ReturnType<typeof supabase.from>['select']>>['1'] = {}
        if (count) options.count = count
        const builder = supabase.from(TABLE_NAME).select('*', options)
        if (filter?.limit && !filter.since) builder.limit(filter.limit)
        else if (filter?.limit && filter?.since)
            builder.range(filter.since, filter.since + filter.limit - 1)
        if (filter?.author) builder.eq('author', filter.author)
        if (filter?.targets) builder.or(filter.targets.map((v) => `target.eq.${v}`).join(','))

        return builder
    }

    public async list(filter?: Partial<Filter>): Promise<Bookmark[]> {
        const { data, status, error } = await this.createBuilder(filter)

        if (status === 406) return []
        if (error) throw error
        return data
    }

    public async count(filter?: Partial<Filter>): Promise<number> {
        const { count, error } = await this.createBuilder(filter, 'exact')

        if (error) throw error
        return count!
    }

    public async isBookmarked(target: number, author: string) {
        const { error, status } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('target', target)
            .eq('author', author)
            .single()
        if (status === 406) return false
        if (error) throw error
        return true
    }
}
