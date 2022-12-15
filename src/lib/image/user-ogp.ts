import type { UploadFile } from '@solid-primitives/upload'

import { createImageURL } from '../api/cloudflare'
import { makeCircle, waitImageLoaded } from './util'

import type { UserProfile } from '~/lib/api/supabase/user'

export const createUserOgp = async (
    profile: UserProfile['Row'],
    headerFile?: UploadFile,
    iconFile?: UploadFile,
) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const background = new Image()
    const icon = new Image()
    icon.src = iconFile ? iconFile.source : createImageURL(`user.icon.${profile.uid}`, 'icon')
    background.src = headerFile
        ? headerFile.source
        : createImageURL(`user.header.${profile.uid}`, 'ogp')
    if (import.meta.env.DEV) {
        background.crossOrigin = icon.crossOrigin = 'Anonymous'
    }

    await makeCircle(icon)

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
