import type { PostgrestResponse } from '@supabase/supabase-js'

import { fetchImageMulti } from './cloudflare'
import { signOut } from './internal/auth'
import { api } from './supabase'

import { supabase } from '~/lib/api/supabase/client'

const checkResult = (result: PostgrestResponse<any>) => {
    if (result.status !== 406 && result.error) throw result.error
    return true
}

export const deleteAccount = async (uid: string) => {
    const posts = await api.image.list(undefined, undefined, false, { author: [uid] })
    await fetchImageMulti(
        [
            `user.icon.${uid}`,
            `user.header.${uid}`,
            `user.ogp.${uid}`,
            ...posts.flatMap((post) =>
                post.information.map((v) => `post.image.${post.id}.${v.index}`),
            ),
        ],
        'DELETE',
        true,
    )

    checkResult(await supabase.from('profiles').delete().eq('uid', uid))
    await signOut()
}
