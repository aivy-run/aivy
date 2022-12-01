import type { UploadFile } from '@solid-primitives/upload'

export const preprocessImage = (file: UploadFile): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        const image = new Image()
        image.src = file.source
        image.onload = () => {
            ctx?.drawImage(image, 0, 0, 256, 256)
            resolve(canvas.toDataURL('image/png'))
        }
        image.onerror = reject
    })
}

export const convertBase64ToFile = (data: string, filename: string) => {
    const blob = atob(data.replace(/^.*,/, ''))
    const buffer = new Uint8Array(blob.length)
    for (let i = 0; i < blob.length; i++) {
        buffer[i] = blob.charCodeAt(i)
    }
    return new File([buffer.buffer], filename)
}

export const urlToBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fetch(url, {
            cache: 'no-store',
        }).then((res) => {
            res.blob().then((blob) => {
                const reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onerror = reject
                reader.onloadend = () => {
                    resolve(reader.result as string)
                }
            })
        })
    })
}
