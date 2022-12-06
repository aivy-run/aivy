import cookie from 'cookie'
import dayjs from 'dayjs'
import type { APIEvent } from 'solid-start'

import { createSupabaseInstance, supabase } from '../supabase/client'

export const withAuth =
    (callback: (event: APIEvent) => Response | Promise<Response>) => async (event: APIEvent) => {
        const unauthorized = () =>
            new Response('Not authenticated', {
                status: 400,
            })

        const sb = createSupabaseInstance()
        const raw = event.request.headers.get('cookie')
        if (!raw) return unauthorized()

        const parsed = cookie.parse(raw)

        const access_token = parsed['aivy-access-token']
        const refresh_token = parsed['aivy-refresh-token']

        if (!access_token || !refresh_token) return unauthorized()

        const { error } = await sb.auth.setSession({ access_token, refresh_token })
        if (error) return unauthorized()

        return await callback(event)
    }

export const initializeCookieSetter = () => {
    supabase.auth.onAuthStateChange((event, session) => {
        const secure = import.meta.env.DEV ? false : true
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            document.cookie = cookie.serialize('aivy-access-token', '', {
                expires: new Date(0),
                sameSite: 'lax',
                secure,
                path: '/',
            })
            document.cookie = cookie.serialize('aivy-refresh-token', '', {
                expires: new Date(0),
                sameSite: 'lax',
                secure,
                path: '/',
            })
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (!session) return
            const maxAge = dayjs.duration({ years: 100 }).asSeconds()
            document.cookie = cookie.serialize('aivy-access-token', session.access_token, {
                maxAge,
                sameSite: 'lax',
                secure,
                path: '/',
            })
            document.cookie = cookie.serialize('aivy-refresh-token', session.refresh_token, {
                maxAge,
                sameSite: 'lax',
                secure,
                path: '/',
            })
        }
    })
}

export const signOut = async () => {
    await supabase.auth.signOut()
    const expires = dayjs().toDate()
    const secure = import.meta.env.DEV ? false : true
    document.cookie = cookie.serialize('aivy-browser-settings', '', {
        secure,
        expires,
        sameSite: 'lax',
        path: '/',
    })
    document.cookie = cookie.serialize('aivy-access-token', '', {
        secure,
        expires,
        sameSite: 'lax',
        path: '/',
    })
    document.cookie = cookie.serialize('aivy-refresh-token', '', {
        secure,
        expires,
        sameSite: 'lax',
        path: '/',
    })
}
