import { CLOUDFLARE_ACCESS_TOKEN$, CLOUDFLARE_ACCOUNT_ID$, ID_PREFIX } from '~/lib/api/cloudflare'
import { withAuth } from '~/lib/api/internal/auth'

export const GET = withAuth(async ({ params, fetch }) => {
    const id = params['id'] as string
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID$()}/images/v1/${ID_PREFIX()}${id}`,
        {
            headers: {
                authorization: `Bearer ${CLOUDFLARE_ACCESS_TOKEN$()}`,
            },
        },
    )
    return res.clone()
})

export const DELETE = withAuth(async ({ params, fetch }) => {
    const id = params['id'] as string
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID$()}/images/v1/${ID_PREFIX()}${id}`,
        {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${CLOUDFLARE_ACCESS_TOKEN$()}`,
            },
        },
    )
    return res.clone()
})
