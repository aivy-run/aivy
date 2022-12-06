import cookie from 'cookie'
import dayjs from 'dayjs'

export const clearCookie = (path = '/') => {
    const parsed = cookie.parse(document.cookie)
    for (const key of Object.keys(parsed)) {
        document.cookie = cookie.serialize(key, '', {
            expires: dayjs().toDate(),
            path,
        })
    }
}
