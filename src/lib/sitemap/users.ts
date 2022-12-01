import dayjs from 'dayjs'

import { api } from '~/lib/api/supabase'

const I = 10000

export const getUsersSitemapCount = async () => {
    const count = await api.user.count()
    const total = Math.ceil(count / I)
    const result: string[] = []
    for (let v = 1; v <= total; v++) {
        result.push(`users.${v}.xml`)
    }
    return result
}

export const generateUsersSitemap = async (i: number) => {
    let xml = ''
    const users = await api.user.list({
        limit: I,
        since: (i - 1) * I,
    })
    if (users.length < 1) return
    for (const user of users) {
        xml += `
<url>
    <loc>https://aivy.run/users/${user.id}</loc>
    <lastmod>${dayjs(user.updated_at).format()}</lastmod>
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
