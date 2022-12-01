import { supabase } from './client'

import type { Database } from '~supabase/database.types'

export type RelationShip = Database['public']['Tables']['relationship']

export type RelationShipFilter = {
    targets: string[]
    authors: string[]
    limit: number
    since: number
    latest: boolean
}

export class RelationShipApi {
    public async addRelationship(target: string, uid: string) {
        const { error } = await supabase.from('relationship').insert({
            target,
            uid,
        })
        if (error) throw error
        return
    }

    public async removeRelationship(target: string, uid: string) {
        const { error } = await supabase
            .from('relationship')
            .delete()
            .eq('target', target)
            .eq('uid', uid)
        if (error) throw error
    }

    private createBuilder(filter?: Partial<RelationShipFilter>) {
        const builder = supabase.from('relationship').select('*')

        if (filter?.latest) builder.order('id', { ascending: false })
        if (filter?.limit && !filter.since) builder.limit(filter.limit)
        else if (filter?.limit && filter?.since)
            builder.range(filter.since, filter.since + filter.limit - 1)

        if (filter?.targets) builder.or(filter.targets.map((v) => `target.eq.${v}`).join(', '))
        if (filter?.authors) builder.or(filter.authors.map((v) => `uid.eq.${v}`).join(', '))
        return builder
    }

    public async getRelationships(
        filter?: Partial<RelationShipFilter>,
    ): Promise<RelationShip['Row'][]> {
        const { data, error, status } = await this.createBuilder(filter)
        if (status === 406) return []
        if (error) throw error
        return data
    }

    public async getOwnRelationships(uid: string): Promise<RelationShip['Row'][]> {
        const { data, error, status } = await supabase
            .from('relationship')
            .select('*')
            .eq('uid', uid)
        if (status === 406) return []
        if (error) throw error
        return data
    }

    public async isFollowing(target: string, uid: string) {
        const { error, status } = await supabase
            .from('relationship')
            .select('*')
            .eq('target', target)
            .eq('uid', uid)
            .single()
        if (status === 406) return false
        if (error) throw error
        return true
    }
}
