import cookie from 'cookie'
import dayjs from 'dayjs'
import semver from 'semver'

import { clearCookie } from './cookie'

import { AIVY_VERSION } from '~/constants'

export const checkVersion = () => {
    const parsed = cookie.parse(document.cookie)
    const saved = parsed['aivy-version'] as string
    if (!semver.valid(saved)) clearCookie()
    else if (semver.lt(saved, AIVY_VERSION)) clearCookie()

    const secure = import.meta.env.DEV ? false : true
    const maxAge = dayjs.duration({ years: 100 }).asSeconds()
    document.cookie = cookie.serialize('aivy-version', AIVY_VERSION, {
        maxAge,
        sameSite: 'lax',
        secure,
        path: '/',
    })
}
