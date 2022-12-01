import dayjs from 'dayjs'

import { supabase } from './client'
import type { UserProfile } from './user'

import type { Database } from '~supabase/database.types'

type CommentFilter = {
    commentable_id: number
    commentable_type: CommentableTypes
    parent_id: number
    limit: number
    since: number
    latest: boolean
}

const CommetableTypes = ['image_post'] as const
export type CommentableTypes = typeof CommetableTypes[number]
export type Comment = Database['public']['Tables']['comments']
export type CompleteComment = Omit<Comment['Row'], 'type' | 'author'> & {
    commentable_type: CommentableTypes
    author: UserProfile['Row']
}

const checkSingle = (data: any): data is CompleteComment =>
    data && CommetableTypes.includes(data.commentable_type) && !Array.isArray(data.author)

const checkMulti = (data: any[]): data is CompleteComment[] =>
    data.filter((v) => !checkSingle(v)).length < 1
export class CommentApi {
    public async comment(
        commentable_id: number,
        commentable_type: CommentableTypes,
        author: string,
        body: string,
        parent_id?: number,
    ) {
        const { data, error } = await supabase
            .from('comments')
            .insert({
                commentable_id,
                commentable_type,
                author,
                body,
                parent_id: parent_id || null,
                created_at: dayjs().format(),
            })
            .select()
            .single()
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    private createBuilder(filter?: Partial<CommentFilter>, count?: boolean) {
        const options: Required<Parameters<ReturnType<typeof supabase.from>['select']>>['1'] = {}
        if (count) options.count = 'exact'
        const builder = supabase.from('comments').select('*, author:profiles!inner(*)', options)
        builder.order('id', { ascending: filter?.latest ? false : true })
        if (filter?.limit && !filter.since) builder.limit(filter.limit)
        else if (filter?.limit && filter?.since)
            builder.range(filter.since, filter.since + filter.limit - 1)
        if (filter?.commentable_type) builder.eq('commentable_type', filter.commentable_type)
        if (filter?.commentable_id) builder.eq('commentable_id', filter.commentable_id)
        if (filter?.parent_id) {
            if (filter.parent_id === -1) builder.is('parent_id', null)
            else builder.eq('parent_id', filter.parent_id)
        }
        return builder
    }

    public async list(filter?: Partial<CommentFilter>): Promise<CompleteComment[]> {
        const { data, error } = await this.createBuilder(filter)
        if (error) throw error
        if (!checkMulti(data)) throw new Error('Incorrect data')
        return data
    }

    public async count(filter?: Partial<CommentFilter>) {
        const { count, error } = await this.createBuilder(filter, true)
        if (error) throw error
        return count!
    }

    public async remove(id: number) {
        const { data, error } = await supabase.from('comments').delete().eq('id', id)
        if (error) throw error
        return data
    }
}
