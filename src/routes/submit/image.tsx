import { createSignal } from 'solid-js'
import { useNavigate } from 'solid-start'

import { FixedTitle } from '~/components/head/title'
import { ImagePostUploader } from '~/components/image-post-form'
import { useModal } from '~/components/ui/modal'
import { WithUser } from '~/components/with-user'
import { createDirectUploadUrl, uploadImage } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'

export default function Upload() {
  const modal = useModal()
  const navigate = useNavigate()

  const [status, setStatus] = createSignal('')

  return (
    <>
      <>
        <FixedTitle>画像をアップロード | Aivy</FixedTitle>
      </>
      <WithUser redirectWhenGuest>
        {({ accessor: [me] }) => (
          <ImagePostUploader
            mode="post"
            status={status()}
            onSubmit={async (post, information, images) => {
              setStatus('投稿中')
              await api.tags.use(post.tags)
              const urls = await createDirectUploadUrl(images.length)

              if (urls.length !== images.length) throw new Error('Failed to generate upload url.')

              const result = await api.image.post({ ...post, author: me().id }, information)

              try {
                for (const [i, image] of Object.entries(images)) {
                  setStatus(
                    `画像をアップロード中 ${i}/${images.length}\n少し時間がかかる場合があります。`,
                  )
                  await uploadImage(urls[parseInt(i)]!, image.file, `post.image.${result.id}.${i}`)
                }
              } catch (error) {
                return modal({
                  title: 'アップロードに失敗しました。',
                  description: 'アップロード中にエラーが発生しました。もう一度やり直してください。',
                })
              }

              await api.image.update(result.id, {
                published: true,
              })
              setStatus('')
              navigate(`/images/${result.id}`)
            }}
          />
        )}
      </WithUser>
    </>
  )
}
