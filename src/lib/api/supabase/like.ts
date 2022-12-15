import { supabase } from './client'

import type { Database } from '~supabase/database.types'

const LikeTypes = ['image_post', 'note_post', 'comment'] as const
export type LikeTypes = typeof LikeTypes[number]
export type Like = Database['public']['Tables']['likes']
export type CompleteLike = Omit<Like['Row'], 'type'> & {
    type: LikeTypes
}

type Filter = {
    targets: number[]
    author: string
    limit: number
    since: number
    type: LikeTypes
}

const checkSingle = (data: any): data is CompleteLike => data && LikeTypes.includes(data.type)
const checkMulti = (data: any[]): data is CompleteLike[] =>
    data.filter((v) => !checkSingle(v)).length < 1

const TABLE_NAME = 'likes'

export class LikeApi {
    public async create(target: number, type: LikeTypes) {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                target,
                type,
            })
            .select()
            .single()
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    public async remove(target: number, type: LikeTypes, author: string) {
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

    public async list(filter?: Partial<Filter>) {
        const { data, status, error } = await this.createBuilder(filter)
        if (status === 406) return []
        if (error) throw error
        if (!checkMulti(data)) throw new Error('Incorrect data')
        return data
    }

    public async count(filter?: Partial<Filter>): Promise<number> {
        const { count, error } = await this.createBuilder(filter, 'exact')

        if (error) throw error
        return count!
    }

    public async isLiked(target: number, type: LikeTypes, author: string) {
        const { error, status } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('type', type)
            .eq('target', target)
            .eq('author', author)
            .single()
        if (status === 406) return false
        if (error) throw error
        return true
    }
}
