import type { PostgrestResponse } from '@supabase/supabase-js'

import { fetchImageMulti } from './cloudflare'
import { signOut } from './internal/auth'

import { supabase } from '~/lib/api/supabase/client'

const checkResult = (result: PostgrestResponse<any>) => {
    if (result.status !== 406 && result.error) throw result.error
    return true
}

export const deleteAccount = async (uid: string) => {
    const { data, error } = await supabase.from('image_posts').select('*').eq('author', uid)
    if (error) throw error
    await fetchImageMulti(
        [
            `user.icon.${uid}`,
            `user.header.${uid}`,
            `user.ogp.${uid}`,
            ...data.flatMap((post) => {
                const list: any[] = []
                list.length = post.images
                list.fill({})
                return list.map((_, i) => `post.image.${post.id}.${i}`)
            }),
        ],
        'DELETE',
        true,
    )

    checkResult(await supabase.from('profiles').delete().eq('uid', uid))
    await signOut()
}
