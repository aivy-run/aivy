import cookie from 'cookie'
import type { APIEvent } from 'solid-start'

import { generateUrlFn$ } from '~/lib/api/cloudflare'
import { createSupabaseInstance } from '~/lib/api/supabase/client'

export const GET = async ({ request }: APIEvent) => {
    const unauthorized = () =>
        new Response('Not authenticated', {
            status: 400,
        })

    const sb = createSupabaseInstance()
    const url = new URL(request.url)
    const raw = request.headers.get('cookie')
    if (!raw) return unauthorized()

    const parsed = cookie.parse(raw)

    const access_token = parsed['aivy-access-token']
    const refresh_token = parsed['aivy-refresh-token']

    if (!access_token || !refresh_token) return unauthorized()

    const { error } = await sb.auth.setSession({ access_token, refresh_token })
    if (error) return unauthorized()

    const count = parseInt(url.searchParams.get('count') || '1') || 1

    const tasks: any[] = []
    for (let v = 0; v < (count < 1 ? 1 : count); v++) {
        tasks.push(generateUrlFn$())
    }

    const urls = await Promise.all(tasks)

    return new Response(JSON.stringify(urls), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}
