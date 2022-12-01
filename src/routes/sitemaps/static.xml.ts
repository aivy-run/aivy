import { generateStaticSitemap } from '~/lib/sitemap/static'

export const GET = () => {
    const xml = generateStaticSitemap()
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public,max-age=86400',
        },
    })
}
