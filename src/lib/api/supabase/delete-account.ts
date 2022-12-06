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

    checkResult(await supabase.from('profiles').delete().eq('uid', uid))

    // delete cookies on sign out
    const expires = new Date(0).toUTCString()
    document.cookie = `aivy-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`
    document.cookie = `aivy-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`
}
