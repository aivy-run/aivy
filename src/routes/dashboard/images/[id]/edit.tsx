import { useParams } from '@solidjs/router'
import { createResource, createSignal, Show } from 'solid-js'
import { useNavigate } from 'solid-start'
import { css } from 'solid-styled-components'

import { NotFoundError } from '~/components/error-handler'
import { ImagePostUploader } from '~/components/image-post-form'
import { Button } from '~/components/ui/button'
import { useModal } from '~/components/ui/modal'
import { HStack, VStack } from '~/components/ui/stack'
import { useState } from '~/hooks/use-state'
import { fetchImageMulti } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'

export default function Upload() {
  const modal = useModal()
  const state = useState()
  const params = useParams()
  const navigate = useNavigate()

  const [data] = createResource(
    () => parseInt(params['id'] || ''),
    async (id) => {
      if (!id) return
      const post = state().post || (await api.image.get(id))
      if (!post) throw new NotFoundError()
      const info = await api.image.getInfo(post.id)
      return { post, info }
    },
  )

  return (
    <Show when={data()} keyed>
      {(data) => (
        <ImagePostUploader
          mode="edit"
          initial={data}
          onSubmit={async (post, information) => {
            await api.tags.post(data.post.tags)
            await api.image.update(data.post.id, post, information)
            navigate(`/images/${data.post.id}`)
          }}
          onDelete={async () => {
            modal({
              render: (close) => {
                const [loading, setLoading] = createSignal(false)
                return (
                  <VStack>
                    <h2>削除します。よろしいですか？</h2>
                    <HStack>
                      <Button onClick={close}>キャンセル</Button>
                      <Button
                        class={css`
                          background-color: #ff6464;

                          &:hover {
                            background-color: #ffa2a2;
                          }
                        `}
                        loading={loading()}
                        onClick={async () => {
                          setLoading(true)
                          await fetchImageMulti(
                            data.info.map((v) => `post.image.${data.post.id}.${v.index}`),
                            'DELETE',
                          )
                          await api.image.delete(data.post.id)
                          setLoading(false)
                          close()
                          navigate('/dashboard/images')
                        }}
                      >
                        削除する
                      </Button>
                    </HStack>
                  </VStack>
                )
              },
            })
          }}
        />
      )}
    </Show>
  )
}
