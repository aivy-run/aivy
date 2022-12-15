export const CLOUDFLARE_ACCOUNT_ID$ = () => process.env['CLOUDFLARE_ACCOUNT_ID']
export const CLOUDFLARE_ACCESS_TOKEN$ = () => process.env['CLOUDFLARE_ACCESS_TOKEN']
export const ID_PREFIX = () =>
    typeof import.meta.env['VITE_ID_PREFIX'] !== 'undefined'
        ? import.meta.env['VITE_ID_PREFIX']
        : import.meta.env.DEV
        ? 'development--'
        : ''

export interface CloudflareImagesResponse<R extends Object> {
    result: R
    success: boolean
    errors: any[]
    messages: any[]
}

const IMAGE_DELIVERY_URL = import.meta.env.DEV
    ? 'https://imagedelivery.net/' + import.meta.env['VITE_CLOUDFLARE_ACCOUNT_HASH']
    : 'https://aivy.run/imagedeliverydelivery/'

export const createImageURL = (id: string, variant = 'public') =>
    `${IMAGE_DELIVERY_URL}/${ID_PREFIX()}${id}/${variant}`

export const createDirectUploadUrl = async <N>(
    count?: N,
): Promise<N extends number ? string[] : string> => {
    const c = count || 1
    const res = await fetch(`/api/images/direct-upload?count=${c}`)
    if (!res.ok) throw new Error(await res.text())
    const json = await res.json()
    if (typeof count === 'undefined') return json[0]
    return json
}

export const fetchImage = (id: string, init?: RequestInit) => fetch(`/api/images/${id}`, init)
export const fetchImageMulti = (id: string[], method: string, ignoreError = false) =>
    fetch(`/api/images/multi`, {
        method: 'POST',
        body: JSON.stringify({ id, method, ignoreError }),
        headers: { 'Content-Type': 'application/json' },
    })

export const uploadImage = async (url: string, file: File, id: string) => {
    const form = new FormData()
    const ext = file.name.split('.').slice(-1)[0]
    form.append('id', `${ID_PREFIX()}${id}`)
    form.append('file', new File([file], `${ID_PREFIX()}${id}.${ext}`))
    const res = await fetch(url, {
        method: 'POST',
        body: form,
    })
    if (res.status !== 200) throw new Error(await res.text())
    const json: CloudflareImagesResponse<{
        id: string
        filename: string
        metadata: {
            key: string
        }
        uploaded: string
        requireSignedURLs: boolean
        variants: string[]
    }> = await res.json()
    return json
}

export const deleteCache = async (id: string, variant: string) => {
    try {
        await fetch(`${IMAGE_DELIVERY_URL}/caches/${ID_PREFIX()}${id}/${variant}`, {
            method: 'DELETE',
        })
        await fetch(createImageURL(id, variant), {
            cache: 'no-cache',
        })
    } catch (error) {
        console.error(error)
    }
}
