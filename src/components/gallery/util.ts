import type { Location } from '@solidjs/router'

import { api } from '~/lib/api/supabase'
import type { ImagesFilter } from '~/lib/api/supabase/images'

export const getPostsData = async (
    all: number,
    page: number,
    random: boolean,
    filter?: Partial<ImagesFilter>,
) => {
    const count = await api.image.count(filter)
    const posts = await api.image.list(all, all * (page - 1), random, filter)
    return { posts, count }
}

export const getPageFromLocation = (location: Location) => {
    const search = new URLSearchParams(location.search)
    return parseInt(search.get('page') || '') || 1
}
