import { CLOUDFLARE_ACCESS_TOKEN$, CLOUDFLARE_ACCOUNT_ID$, ID_PREFIX } from '~/lib/api/cloudflare'
import { withAuth } from '~/lib/api/internal/auth'

type RequestBody = {
    method: 'GET' | 'DELETE'
    id: string[]
    ignoreError: boolean
}

const validate = (data: any): data is RequestBody => data && data.method && data.id

export const POST = withAuth(async ({ request, fetch }) => {
    if (!request.body) return new Response('Bad request', { status: 400 })
    const { value } = await request.body.getReader().read()
    if (!value) return new Response('Internal Server Error', { status: 500 })
    try {
        const json = JSON.parse(value.toString())
        if (!validate(json)) return new Response('Bad request', { status: 400 })

        for (const v of json.id) {
            const res = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID$()}/images/v1/${ID_PREFIX()}${v}`,
                {
                    method: json.method,
                    headers: {
                        authorization: `Bearer ${CLOUDFLARE_ACCESS_TOKEN$()}`,
                    },
                },
            )
            if (!res.ok && !json.ignoreError)
                return new Response(`An error occurred in ${v}`, { ...res })
        }
        return new Response('Success')
    } catch (error) {
        return new Response('Internal Server Error', { status: 500 })
    }
})
