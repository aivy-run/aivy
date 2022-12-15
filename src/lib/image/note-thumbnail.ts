import { createImageURL } from '../api/cloudflare'
import type { CompleteNotePost } from '../api/supabase/notes'
import { makeCircle } from './util'

const wrapText = (ctx: CanvasRenderingContext2D, text: string, width: number) => {
    const words = text.split('')
    let line = ''
    const lines: string[] = []
    for (const word of words) {
        const testLine = line + word + ''
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > width && line.length > 0) {
            lines.push(line)
            line = word + ''
        } else {
            line = testLine
        }
    }
    lines.push(line)
    return lines
}
export const createNoteThumbnail = async (note: CompleteNotePost) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const icon = new Image()
    icon.src = createImageURL(`user.icon.${note.profiles.uid}`, 'icon')
    if (import.meta.env.DEV) icon.crossOrigin = 'Anonymous'
    await makeCircle(icon)

    const cw = (canvas.width = 1200),
        ch = (canvas.height = 630)

    ctx.fillStyle = '#68a9ff'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#8bbdff'
    ctx.fillRect(8, 8, cw - 16, ch - 16)
    ctx.fillStyle = '#aed1ff'
    ctx.fillRect(16, 16, cw - 32, ch - 32)
    ctx.fillStyle = '#fff'
    ctx.fillRect(24, 24, cw - 48, ch - 48)

    ctx.drawImage(icon, 50, 450, 125, 125)

    ctx.font = "bold 28px 'Noto Sans JP'"
    ctx.fillStyle = '#333'
    ctx.fillText(`@${note.profiles.id}`, 185, 560)

    ctx.font = "bold 64px 'Noto Sans JP'"
    ctx.fillStyle = '#333'
    ctx.fillText(note.profiles.username, 185, 520)

    ctx.font = "bold 64px 'Noto Sans JP'"
    ctx.fillStyle = '#333'
    wrapText(ctx, note.title, 1100).forEach((v, i) => ctx.fillText(v, 64, 128 * (i + 1)))

    return new Promise<Blob>((resolve, _) => canvas.toBlob((blob) => resolve(blob!), 'image/png'))
}
