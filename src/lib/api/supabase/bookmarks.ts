import { supabase } from './client'

import type { Database } from '~supabase/database.types'

const BookmarkTypes = ['image_post', 'note_post', 'comment'] as const
export type BookmarkTypes = typeof BookmarkTypes[number]
export type Bookmark = Database['public']['Tables']['bookmarks']
export type CompleteBookmark = Omit<Bookmark['Row'], 'type'> & {
    type: BookmarkTypes
}
type Filter = {
    targets: number[]
    author: string
    limit: number
    since: number
    type: BookmarkTypes
}

const TABLE_NAME = 'bookmarks'

export class BookmarkApi {
    public async create(target: number, type: BookmarkTypes) {
        const { error } = await supabase.from(TABLE_NAME).insert({
            target,
            type,
        })
        if (error) throw error
        return
    }

    public async remove(target: number, type: BookmarkTypes, author: string) {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('target', target)
            .eq('type', type)
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
        if (filter?.type) builder.eq('type', filter.type)
        if (filter?.author) builder.eq('author', filter.author)
        if (filter?.targets) builder.or(filter.targets.map((v) => `target.eq.${v}`).join(','))

        return builder
    }

    public async list(filter?: Partial<Filter>): Promise<Bookmark['Row'][]> {
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

    public async isBookmarked(target: number, type: BookmarkTypes, author: string) {
        const { error, status } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('target', target)
            .eq('type', type)
            .eq('author', author)
            .single()
        if (status === 406) return false
        if (error) throw error
        return true
    }
}
