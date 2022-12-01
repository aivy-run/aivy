import type { PostgrestResponse } from '@supabase/supabase-js'

import { supabase } from '~/lib/api/supabase/client'

const checkResult = (result: PostgrestResponse<any>) => {
    if (result.status !== 406 && result.error) throw result.error
    return true
}

export const deleteAccount = async (
    uid: string,
    d: (vars: { ids: number[]; uid: string }) => Promise<void[]>,
) => {
    const image_posts = await supabase.from('image_posts').select('id').eq('author', uid)
    const ids = image_posts.data!.map((v) => v.id)
    checkResult(image_posts)
    d({ ids, uid })
    if (ids.length > 0)
        checkResult(
            await supabase
                .from('image_posts_information')
                .delete()
                .or(ids.map((v) => `post_id.eq.${v}`).join(',')),
        )
    checkResult(
        await supabase.from('notifications').delete().or(`author.eq.${uid},target_user.eq.${uid}`),
    )

    const tasks = [
        (async () => checkResult(await supabase.from('image_posts').delete().eq('author', uid)))(),
        (async () => checkResult(await supabase.from('bookmarks').delete().eq('author', uid)))(),
        (async () => checkResult(await supabase.from('comments').delete().eq('author', uid)))(),
        (async () => checkResult(await supabase.from('likes').delete().eq('author', uid)))(),

        (async () =>
            checkResult(
                await supabase.from('relationship').delete().or(`uid.eq.${uid},target.eq.${uid}`),
            ))(),
    ]
    await Promise.all(tasks)
    checkResult(await supabase.from('profiles').delete().eq('uid', uid))

    // delete cookies on sign out
    const expires = new Date(0).toUTCString()
    document.cookie = `aivy-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`
    document.cookie = `aivy-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`
}
