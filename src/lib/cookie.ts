import dayjs from 'dayjs'
import { parseCookie, serializeCookie } from 'solid-start'

export const clearCookie = (path = '/') => {
    const parsed = parseCookie(document.cookie)
    for (const key of Object.keys(parsed)) {
        document.cookie = serializeCookie(key, '', {
            expires: dayjs().toDate(),
            path,
        })
    }
}
