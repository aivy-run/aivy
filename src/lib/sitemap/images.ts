import dayjs from 'dayjs'

import { api } from '~/lib/api/supabase'

const I = 10000

export const getImageSitemapCount = async () => {
    const count = await api.image.count()
    const total = Math.ceil(count / I)
    const result: string[] = []
    for (let v = 1; v <= total; v++) {
        result.push(`images.${v}.xml`)
    }
    return result
}

export const generateImagesSitemap = async (i: number) => {
    let xml = ''
    const posts = await api.image.list(I, (i - 1) * I, false)
    if (posts.length < 1) return
    for (const post of posts) {
        xml += `
<url>
    <loc>https://aivy.run/images/${post.id}</loc>
    <lastmod>${dayjs(post.updated_at).format()}</lastmod>
    <changefreq>weekly</changefreq>
</url>`
    }
    const result = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xml}
</urlset>
`
        .replace(/\n */g, '')
        .trim()
    return result
}
