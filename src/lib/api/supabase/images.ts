import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import dayjs from 'dayjs'

import { supabase } from './client'
import type { UserProfile } from './user'

import type { Database } from '~supabase/database.types'

export type ImageInformation = Database['public']['Tables']['image_posts_information']

export type ImagePost = Database['public']['Tables']['image_posts']

export type CompleteImagePost = ImagePost['Row'] & {
    profiles: UserProfile['Row']
    information: ImageInformation['Row'][]
}

export type ImagesFilter = {
    ids: number[]
    author: string[]
    authorOr: string[]
    contest_id: number
    tags: string[]
    zoning: ImagePost['Row']['zoning'][]
    search: string
    likedBy: string
    latest: boolean
    build: (builder: PostgrestFilterBuilder<any, any, any>) => void
    published: boolean

    _mute: string[]
    _zoning: ImagePost['Row']['zoning'][]
}

const checkSingle = (data: any): data is CompleteImagePost =>
    data && !Array.isArray(data.profiles) && Array.isArray(data.information)
const checkMulti = (data: any[]): data is CompleteImagePost[] =>
    data.filter((v) => !checkSingle(v)).length < 1

export class ImagePostApi {
    public async post(postData: ImagePost['Insert'], information: ImageInformation['Insert'][]) {
        const post = await supabase
            .from('image_posts')
            .insert({ ...postData, created_at: dayjs().format() })
            .select()
            .single()
        if (post.error) throw post.error

        const info = await supabase
            .from('image_posts_information')
            .insert(
                information.map((v, i) => ({
                    ...v,
                    post_id: post.data.id,
                    index: i,
                })),
            )
            .select()
        if (info.error) throw info.error

        return { ...post.data, information: info.data }
    }

    public async delete(id: number) {
        const { error } = await supabase.from('image_posts').delete().eq('id', id)
        if (error) throw error
        return
    }

    public async update(
        id: number,
        postData: ImagePost['Update'],
        information?: ImageInformation['Update'][],
    ) {
        const post = await supabase
            .from('image_posts')
            .update({ ...postData, updated_at: dayjs().format() })
            .eq('id', id)
            .select('*, profiles!inner(*), information:image_posts_information!inner(*)')
            .single()
        if (post.error) throw post.error
        if (information) {
            const info = await Promise.all(
                information.map(async (v) => {
                    const { data, error } = await supabase
                        .from('image_posts_information')
                        .update(v)
                        .eq('post_id', id)
                        .eq('index', v.index)
                        .select()
                        .single()
                    if (error) throw error
                    return data
                }),
            )
            post.data.information = info
        }
        return post.data
    }

    public async get(id: number) {
        const { data, error, status } = await supabase
            .from('image_posts')
            .select('*, profiles!inner(*), information:image_posts_information!inner(*)')
            .eq('id', id)
            .single()
        if (status === 406) return
        if (error) throw error
        if (!checkSingle(data)) throw new Error('Incorrect data')
        return data
    }

    private createBuilder(
        filter?: Partial<ImagesFilter>,
        random = false,
        count?: 'exact' | 'planned' | 'estimated',
    ) {
        const options: Required<Parameters<ReturnType<typeof supabase.from>['select']>>['1'] = {}
        if (count) options.count = count
        const builder = supabase
            .from('image_posts')
            .select('*, profiles!inner(*), information:image_posts_information!inner(*)', options)

        if (random) builder.order('uid', { foreignTable: 'profiles', ascending: false })

        if (typeof filter?.published !== 'boolean') builder.eq('published', true)
        else builder.eq('published', filter.published)

        if (!random && filter?.latest) builder.order('id', { ascending: false })
        if (filter?.ids && filter.ids.length > 0)
            builder.or(filter.ids.map((v) => `id.eq.${v}`).join(','))
        if (filter?.author && filter.author.length > 0)
            for (const v of filter.author) builder.eq('author', v)
        if (filter?.authorOr && filter.authorOr.length > 0)
            builder.or(filter.authorOr.map((v) => `author.eq.${v}`).join(','))

        if (filter?.contest_id) builder.eq('contest_id', filter.contest_id)

        if (filter?.tags) builder.contains('tags', filter.tags)

        if (!filter?.zoning && filter?._zoning)
            builder.or(filter._zoning.map((v) => `zoning.eq.${v}`).join(','))
        else if (filter?.zoning) builder.or(filter.zoning.map((v) => `zoning.eq.${v}`).join(','))
        if (filter?._mute) for (const mute of filter._mute) builder.neq('author', mute)
        if (filter?.search) this.search(builder, filter.search)
        if (filter?.build) filter.build(builder)

        return builder
    }

    public async list(limit = 5, since = 0, random = false, filter?: Partial<ImagesFilter>) {
        const builder = this.createBuilder(filter, random)
        const { data, error } = await builder.range(since, since + limit - 1)
        if (error) throw error
        if (!checkMulti(data)) throw new Error('Incorrect data')
        return data
    }

    public async count(filter?: Partial<ImagesFilter>): Promise<number> {
        const builder = this.createBuilder(filter, false, 'exact')
        const { count, error } = await builder
        if (error) throw error
        return count!
    }

    public async search(builder: PostgrestFilterBuilder<any, any, any>, query: string) {
        // eslint-disable-next-line no-irregular-whitespace
        query = query.replace(/　/g, ' ')
        const options = (query.match(/\(.+?\)/g) || []).map((v) => v.replace(/^\(|\)$/g, ''))
        const words = query
            .replace(/\(.+?\)/g, '')
            .split(' ')
            .filter((v) => !!v)
        for (const option of options) {
            const [key, value] = option.split(':') as [string, string]
            const trimmed = value.trimStart()
            switch (key.trim()) {
                case 'username':
                    builder.ilike('profiles.username', `${trimmed}%`)
                    break
                case 'id':
                    builder.eq('profiles.id', trimmed)
                    break
                case 'tag':
                    builder.contains('tags', [trimmed.split(' ')])
                    break
                case 'prompt':
                    builder.ilike('information.prompt', `%${trimmed}%`)
                    break
                case 'negative_prompt':
                    builder.ilike('information.negative_prompt', `%${trimmed}%`)
                    break
            }
        }
        for (const v of words) {
            const word = v.trimStart()
            builder.or(`title.ilike.%${word}%,description.ilike.%${word}%,tags.cs.{${word}}`)
        }
    }

    public async increaseViews(target: number) {
        const { error } = await supabase.rpc('increase_image_post_view', {
            target,
        })
        if (error) throw error
    }
}
