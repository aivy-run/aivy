import { supabase } from './client'
import type { Comment } from './comments'
import type { ImagePost } from './images'
import type { NotePost } from './notes'

import type { UserProfile } from '~/lib/api/supabase/user'
import type { Database } from '~supabase/database.types'

const NotificationType = [
    'image_post_like',
    'note_post_like',
    'comment_like',
    'image_post_comment',
    'image_post_comment_reply',
    'note_post_comment',
    'note_post_comment_reply',
    'relationship',
] as const

export type NotificationType = typeof NotificationType[number]
export type Notification = Database['public']['Tables']['notifications']
export type CompleteNotification = Omit<
    Notification['Row'],
    'type' | 'author' | 'target_image_post' | 'target_user'
> & {
    type: NotificationType
    author: UserProfile['Row']
    target_image_post?: ImagePost['Row']
    target_note_post?: NotePost['Row']
    target_comment?: Comment['Row']
    target_user: UserProfile['Row']
}

export type NotificationFilter = Partial<{
    limit: number
    since: number
    type: NotificationType
    target_user: string
    read: boolean
    latest: boolean
}>

const checkSingle = (data: any): data is CompleteNotification =>
    data && NotificationType.includes(data.type) && !Array.isArray(data.author)

const checkMulti = (data: any[]): data is CompleteNotification[] =>
    data.filter((v) => !checkSingle(v)).length < 1

export class NotificationApi {
    private createBuilder(filter?: NotificationFilter, count?: 'exact' | 'planned' | 'estimated') {
        const options: Required<Parameters<ReturnType<typeof supabase.from>['select']>>['1'] = {}
        if (count) options.count = count
        const builder = supabase
            .from('notifications')
            .select(
                '*, target_image_post(*), target_note_post(*), target_user!inner(*), author!inner(*)',
                options,
            )

        if (filter?.latest) builder.order('id', { ascending: false })
        if (filter?.limit && !filter.since) builder.limit(filter.limit)
        else if (filter?.limit && filter?.since)
            builder.range(filter.since, filter.since + filter.limit - 1)

        if (filter?.type) builder.eq('type', filter.type)
        if (typeof filter?.read === 'boolean') builder.eq('read', filter.read)
        if (filter?.target_user) builder.eq('target_user.uid', filter.target_user)

        return builder
    }
    public async list(filter: NotificationFilter): Promise<CompleteNotification[]> {
        const builder = this.createBuilder(filter)
        const { data, error, status } = await builder
        if (status === 406) return []
        if (error) throw error
        if (!checkMulti(data)) throw new Error('Incorrect data')
        return data
    }

    public async count(filter?: NotificationFilter): Promise<number> {
        const selection = this.createBuilder(filter, 'exact')
        const { count, error } = await selection
        if (error) throw error
        return count!
    }

    public async read(ids: number[]) {
        const { error } = await supabase
            .from('notifications')
            .update({
                read: true,
            })
            .or(ids.map((v) => `id.eq.${v}`).join(','))
        if (error) throw error
    }
}
