import type { APIEvent } from 'solid-start'

import { generateImagesSitemap } from '~/lib/sitemap/images'
import { generateUsersSitemap } from '~/lib/sitemap/users'

const notFound = (url: string) => new Response(`${url} is not found`, { status: 404 })

export const GET = async ({ request, params }: APIEvent) => {
    const filename = params['filename'] as string
    const [type, i] = filename.split('.')
    if (!type || !i) return notFound(request.url)
    const index = parseInt(i)
    if (!index) return notFound(request.url)
    const getter = type === 'images' ? generateImagesSitemap : generateUsersSitemap
    const xml = await getter(index)
    if (!xml) return notFound(request.url)
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': `${xml.length}`,
            'Cache-Control': 'public,max-age=86400',
        },
    })
}
