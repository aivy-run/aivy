import { api } from '../supabase'

const genSlug = () => {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const N = 16
    return Array(N)
        .fill(null)
        .map(() => S[Math.floor(Math.random() * S.length)])
        .join('')
}

export const postNote = () => {
    const slug = genSlug()
    return api.note.post({
        body: [],
        slug,
    })
}
