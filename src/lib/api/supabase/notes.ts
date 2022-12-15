import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

import { supabase } from './client'
import type { UserProfile } from './user'

import type { Database } from '~supabase/database.types'

export type NotePost = Database['public']['Tables']['note_posts']
export type CompleteNotePost = NotePost['Row'] & {
    profiles: UserProfile['Row']
}

export type NotesFilter = {
    limit: number
    since: number
    ids: number[]
    slugs: string[]
    author: string[]
    authorOr: string[]
    tags: string[]
    likedBy: string
    latest: boolean
    build: (builder: PostgrestFilterBuilder<any, any, any>) => void
    published: boolean

    _mute: string[]
}

const checkSingle = (data: any): data is CompleteNotePost => data && !Array.isArray(data.profiles)
const checkMulti = (data: any[]): data is CompleteNotePost[] =>
    data.filter((v) => !checkSingle(v)).length < 1

export class NoteApi {
    public async post(post: NotePost['Insert']) {
        const { data, error } = await supabase
            .from('note_posts')
            .insert(post)
            .select('*, profiles!inner(*)')
            .single()
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    public async update(id: number, post: NotePost['Update']) {
        const { data, error } = await supabase
            .from('note_posts')
            .update(post)
            .eq('id', id)
            .select('*, profiles!inner(*)')
            .single()
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    public async remove(id: number) {
        const { error } = await supabase.from('note_posts').delete().eq('id', id)
        if (error) throw error
        return
    }

    public async get(id: number) {
        const { data, error } = await supabase
            .from('note_posts')
            .select('*, profiles!inner(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    public async getBySlug(slug: string) {
        const { data, error } = await supabase
            .from('note_posts')
            .select('*, profiles!inner(*)')
            .eq('slug', slug)
            .single()
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    private createBuilder(
        filter?: Partial<NotesFilter>,
        count?: 'exact' | 'planned' | 'estimated',
    ) {
        const options: Required<Parameters<ReturnType<typeof supabase.from>['select']>>['1'] = {}
        if (count) options.count = count
        const builder = supabase.from('note_posts').select('*, profiles!inner(*)', options)

        if (typeof filter?.published === 'boolean') builder.eq('published', filter?.published)
        if (filter?.limit && !filter.since) builder.limit(filter.limit)
        else if (filter?.limit && filter?.since)
            builder.range(filter.since, filter.since + filter.limit - 1)

        if (filter?.latest) builder.order('id', { ascending: false })
        if (filter?.ids && filter.ids.length > 0)
            builder.or(filter.ids.map((v) => `id.eq.${v}`).join(','))
        if (filter?.slugs && filter.slugs.length > 0)
            builder.or(filter.slugs.map((v) => `slug.eq.${v}`).join(','))
        if (filter?.author && filter.author.length > 0)
            for (const v of filter.author) builder.eq('author', v)
        if (filter?.authorOr && filter.authorOr.length > 0)
            builder.or(filter.authorOr.map((v) => `author.eq.${v}`).join(','))

        if (filter?.tags) builder.contains('tags', filter.tags)

        if (filter?._mute) for (const mute of filter._mute) builder.neq('author', mute)
        if (filter?.build) filter.build(builder)

        return builder
    }

    public async list(filter?: Partial<NotesFilter>) {
        const builder = this.createBuilder(filter)
        const { data, error } = await builder
        if (error) throw error
        if (!checkMulti(data)) throw new Error('Incorrect data')
        return data
    }

    public async count(filter?: Partial<NotesFilter>): Promise<number> {
        const builder = this.createBuilder(filter, 'exact')
        const { count, error } = await builder
        if (error) throw error
        return count!
    }
}
