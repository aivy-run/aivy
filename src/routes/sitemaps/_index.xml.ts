import { getImageSitemapCount } from '~/lib/sitemap/images'
import { getUsersSitemapCount } from '~/lib/sitemap/users'

export const GET = async () => {
    const imagePosts = await getImageSitemapCount()
    const imagePostsUrls = imagePosts.map(
        (v) => `
<sitemap>
    <loc>https://aivy.run/sitemaps/${v}</loc>
</sitemap>
`,
    )
    const users = await getUsersSitemapCount()
    const usersUrls = users.map(
        (v) => `
<sitemap>
    <loc>https://aivy.run/sitemaps/${v}</loc>
</sitemap>
`,
    )
    const result = `
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>https://aivy.run/sitemaps/static.xml</loc>
    </sitemap>
    ${imagePostsUrls.join('')}
    ${usersUrls.join('')}
</sitemapindex>`
        .replace(/\n */g, '')
        .trim()
    return new Response(result, {
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': `${result.length}`,
            'Cache-Control': 'public,max-age=86400',
        },
    })
}
