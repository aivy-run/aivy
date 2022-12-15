import { createFileUploader } from '@solid-primitives/upload'
import type { Editor } from '@tiptap/core'
import { v4 as uuid } from 'uuid'

import { createDirectUploadUrl, createImageURL, uploadImage } from '~/lib/api/cloudflare'

export const uploadFile = (editor: Editor, id: number) =>
    new Promise<void>((resolve, reject) => {
        const { selectFiles } = createFileUploader({ multiple: true, accept: 'image/*' })
        selectFiles(async (files) => {
            try {
                const urls = await createDirectUploadUrl(files.length)
                for (const [i, v] of Object.entries(urls)) {
                    const imageId = `post.note.images.${id}.${uuid()}`
                    await uploadImage(v, files[parseInt(i)]!.file, imageId)
                    editor
                        .chain()
                        .focus()
                        .setImage({ src: createImageURL(imageId) })
                        .run()
                }
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    })
