export const waitImageLoaded = (image: HTMLImageElement) => {
    return new Promise<void>((resolve, reject) => {
        if (image.complete) resolve()
        image.onload = () => resolve()
        image.onerror = (e) => reject(e)
    })
}

export const makeCircle = async (image: HTMLImageElement, px = 200) => {
    await waitImageLoaded(image)
    const canvas = document.createElement('canvas')
    const cw = (canvas.width = px),
        ch = (canvas.height = px)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0, px, px)
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()

    image.src = canvas.toDataURL('image/png')
    await waitImageLoaded(image)
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}
