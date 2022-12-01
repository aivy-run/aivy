import type { UploadFile } from '@solid-primitives/upload'

import { createImageURL } from './api/cloudflare'

import type { UserProfile } from '~/lib/api/supabase/user'

const waitImageLoaded = (image: HTMLImageElement) => {
    return new Promise<void>((resolve, reject) => {
        if (image.complete) resolve()
        image.onload = () => resolve()
        image.onerror = (e) => reject(e)
    })
}

const fetchImage = async (url: string) => {
    const res = await fetch(url)
    if (res.status !== 200) throw new Error(await res.text())
    const blob = await res.blob()
    const base64 = await new Promise<string>((resolve, _) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
    })
    return base64
}

const createIcon = async (url: string) => {
    const base64 = await fetchImage(url)
    const icon = new Image()
    icon.src = base64
    await waitImageLoaded(icon)
    const canvas = document.createElement('canvas')
    const cw = (canvas.width = 200),
        ch = (canvas.height = 200)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(icon, 0, 0)

    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()

    return canvas.toDataURL('image/png')
}

export const createOgp = async (
    profile: UserProfile['Row'],
    headerFile?: UploadFile,
    iconFile?: UploadFile,
) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const background = new Image()
    const icon = new Image()
    icon.src = iconFile
        ? iconFile.source
        : await createIcon(createImageURL(`user.icon.${profile.uid}`, 'icon'))
    background.src = headerFile
        ? headerFile.source
        : await fetchImage(createImageURL(`user.header.${profile.uid}`, 'ogp'))

    await waitImageLoaded(background)
    await waitImageLoaded(icon)

    const width = background.width,
        height = background.height,
        rate = width / height,
        cw = (canvas.width = 1200),
        ch = (canvas.height = 630),
        aspect = cw / ch
    if (rate >= aspect) {
        const ratio = height / ch,
            position = (cw - width / ratio) / 2
        ctx.drawImage(background, position, 0, width / ratio, ch)
    } else {
        const ratio = width / cw,
            position = (ch - height / ratio) / 2
        ctx.drawImage(background, 0, position, cw, height / ratio)
    }

    ctx.shadowColor = '#333'
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 10

    ctx.drawImage(icon, 25, 25, 150, 150)

    ctx.font = "bold 36px 'Noto Sans JP'"
    ctx.fillStyle = '#eee'
    ctx.fillText(`@${profile.id}`, 200, 150)

    ctx.font = "bold 64px 'Noto Sans JP'"
    ctx.fillStyle = '#fff'
    ctx.fillText(profile.username, 200, 90)

    return new Promise<Blob>((resolve, _) => canvas.toBlob((blob) => resolve(blob!), 'image/png'))
}
