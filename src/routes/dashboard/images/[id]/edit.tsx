import { useParams } from '@solidjs/router'
import { createSignal, onMount, Show } from 'solid-js'
import { useNavigate } from 'solid-start'
import { css } from 'solid-styled-components'

import { NotFoundError } from '~/components/error-handler'
import { ImagePostUploader } from '~/components/image-post-form/image-post-uploader'
import { Button } from '~/components/ui/button'
import { useModal } from '~/components/ui/modal'
import { HStack, VStack } from '~/components/ui/stack'
import { useState } from '~/hooks/use-state'
import { fetchImageMulti } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteImagePost } from '~/lib/api/supabase/images'
import type { UserProfile } from '~/lib/api/supabase/user'

export default function Upload() {
  const modal = useModal()
  const state = useState()
  const params = useParams()
  const navigate = useNavigate()
  const [author, setAuthor] = createSignal<UserProfile['Row']>()
  const [data, setData] = createSignal<CompleteImagePost>()

  onMount(async () => {
    const id = parseInt(params['id'] as string)
    if (!id) return
    const post = state().post
    if (post) {
      setData({ ...post, author: post.profiles.uid })
      setAuthor(post.profiles)
    } else {
      const post = await api.image.get(id)
      if (!post) throw new NotFoundError()
      setAuthor(post.profiles)
      setData({ ...post, author: post.profiles.uid })
    }
  })

  return (
    <Show when={data()} keyed>
      {(post) => (
        <ImagePostUploader
          mode="edit"
          initial={post}
          onSubmit={async (post, information) => {
            await api.tags.post(post.tags)
            const result = await api.image.update(data()!.id, post, information)
            navigate(`/images/${data()!.id}`, {
              state: {
                post: {
                  ...result,
                  profiles: author(),
                },
              },
            })
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
                            post.information.map((v) => `post.image.${data()!.id}.${v.index}`),
                            'DELETE',
                          )
                          await api.image.delete(data()!.id)
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
