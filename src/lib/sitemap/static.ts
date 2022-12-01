import dayjs from 'dayjs'

export const generateStaticSitemap = () => {
    const today = dayjs().format('YYYY-MM-DD')
    return `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://aivy.run</loc>
        <lastmod>${dayjs(today).format()}</lastmod>
        <changefreq>always</changefreq>
    </url>
</urlset>
`
        .replace(/\n */g, '')
        .trim()
}
