import { request } from 'undici'

import {
    CloudflareImagesResponse,
    CLOUDFLARE_ACCESS_TOKEN$,
    CLOUDFLARE_ACCOUNT_ID$,
} from '~/lib/api/cloudflare'
import { withAuth } from '~/lib/api/internal/auth'

const generate = async () => {
    if (!CLOUDFLARE_ACCESS_TOKEN$()) throw new Error('Access token is not defined')
    const { statusCode, body } = await request(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID$()}/images/v1/direct_upload`,
        {
            method: 'POST',
            headers: {
                authorization: `Bearer ${CLOUDFLARE_ACCESS_TOKEN$()}`,
            },
        },
    )

    if (statusCode !== 200) throw new Error(await body.text())

    const json: CloudflareImagesResponse<{
        id: string
        uploadURL: string
    }> = await body.json()
    return json.result.uploadURL
}
export const GET = withAuth(async ({ request }) => {
    const url = new URL(request.url)
    const count = parseInt(url.searchParams.get('count') || '1') || 1

    const tasks: any[] = []
    for (let v = 0; v < (count < 1 ? 1 : count); v++) {
        tasks.push(generate())
    }

    const urls = await Promise.all(tasks)

    return new Response(JSON.stringify(urls), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
})
