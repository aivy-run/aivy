const ID$ = () => process.env['CLOUDFLARE_ACCOUNT_ID']
const TOKEN$ = () => process.env['CLOUDFLARE_ACCESS_TOKEN']
const ID_PREFIX = () =>
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

const IMAGE_DELIVERY_URL = 'https://aivy.run/imagedelivery'

export const createImageURL = (id: string, variant = 'public') =>
    `${IMAGE_DELIVERY_URL}/delivery/${ID_PREFIX()}${id}/${variant}`

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

export const generateUrlFn$ = async () => {
    if (!TOKEN$()) throw new Error('Access token is not defined')
    const { request } = await import('undici')
    const { statusCode, body } = await request(
        `https://api.cloudflare.com/client/v4/accounts/${ID$()}/images/v1/direct_upload`,
        {
            method: 'POST',
            headers: {
                authorization: `Bearer ${TOKEN$()}`,
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

export const getImageFn$ = async (id: string) => {
    const { request } = await import('undici')
    const { statusCode, body } = await request(
        `https://api.cloudflare.com/client/v4/accounts/${ID$()}/images/v1/${ID_PREFIX()}${id}`,
        {
            headers: {
                authorization: `Bearer ${TOKEN$()}`,
            },
        },
    )
    if (statusCode === 404) return
    if (statusCode !== 200) throw new Error(await body.text())
    const json: CloudflareImagesResponse<{
        id: string
        filename: string
        metadata: {
            key: string
        }[]
        requireSignedURLs: boolean
        variants: string[]
        uploaded: string
    }> = await body.json()
    return json
}

export const deleteImageFn$ = async (id: string) => {
    const { request } = await import('undici')
    const { statusCode, body } = await request(
        `https://api.cloudflare.com/client/v4/accounts/${ID$()}/images/v1/${ID_PREFIX()}${id}`,
        {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${TOKEN$()}`,
            },
        },
    )
    if (statusCode !== 200) throw new Error(await body.text())
    return
}

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
        await fetch(`${IMAGE_DELIVERY_URL}/delivery/caches/${ID_PREFIX()}${id}/${variant}`, {
            method: 'DELETE',
        })
        await fetch(createImageURL(id, variant), {
            cache: 'no-cache',
        })
    } catch (error) {
        console.error(error)
    }
}
