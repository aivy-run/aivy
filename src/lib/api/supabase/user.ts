import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

import { supabase } from '~/lib/api/supabase/client'
import type { Database } from '~supabase/database.types'

export type Zoning = 'normal' | 'r18' | 'r18g'
export type UserProfile = Database['public']['Tables']['profiles']

export type UserFilter = {
    ids: string[]
    uids: string[]
    limit: number
    since: number
    search: string
    latest: boolean
    build: (builder: PostgrestFilterBuilder<any, any, any>) => void
}

export class UserApi {
    public async count(): Promise<number> {
        const { count, error } = await supabase.from('profiles').select('uid', { count: 'exact' })
        if (error) throw error
        return count!
    }

    public async get(uid: string) {
        const { data, status, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('uid', uid)
            .single()
        if (status === 406) return
        if (error) return
        return data
    }

    public async getByID(id: string) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
        if (error) return
        return data
    }

    private createBuilder(filter?: Partial<UserFilter>, count?: 'exact' | 'planned' | 'estimated') {
        const options: Required<Parameters<ReturnType<typeof supabase.from>['select']>>['1'] = {}
        if (count) options.count = count
        const builder = supabase.from('profiles').select('*', options)

        if (filter?.latest) builder.order('id', { ascending: false })
        if (filter?.uids && filter.uids.length > 0)
            builder.or(filter.uids.map((v) => `uid.eq.${v}`).join(','))
        if (filter?.ids && filter.ids.length > 0)
            builder.or(filter.ids.map((v) => `id.eq.${v}`).join(','))

        if (filter?.limit && !filter.since) builder.limit(filter.limit)
        else if (filter?.limit && filter?.since)
            builder.range(filter.since, filter.since + filter.limit - 1)

        if (filter?.build) filter.build(builder)

        return builder
    }

    public async list(filter?: Partial<UserFilter>) {
        const builder = this.createBuilder(filter)
        const { data, error } = await builder
        if (error) throw error
        return data
    }
}
