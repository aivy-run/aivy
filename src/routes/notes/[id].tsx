import { createMemo, createResource, Show } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Meta, useParams } from 'solid-start'
import { useRequest } from 'solid-start/server'

import { NotFoundError } from '~/components/error-handler'
import { FixedTitle } from '~/components/head/title'
import { NotePostView } from '~/components/note-post'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteNotePost } from '~/lib/api/supabase/notes'

export default function Note() {
  const params = useParams()
  const id = createMemo(() => parseInt(params['id'] || ''))
  const [data] = createResource(id, async (id) => {
    try {
      const post = await api.note.get(id)
      return post
    } catch (error) {
      throw new NotFoundError()
    }
  })

  const isTwitterBot = () => {
    const { request } = useRequest()
    const agent = request.headers.get('user-agent') || ''
    return agent.toLowerCase().startsWith('twitterbot')
  }

  const title = (post: CompleteNotePost) => {
    if (!post?.id) return ''
    const title = post.title
    const username = post.profiles.username
    return `${title} - ${username}`
  }

  return (
    <Show when={data()} keyed>
      {(data) => (
        <>
          <>
            <FixedTitle>{title(data)}</FixedTitle>
            <Meta property="og:title" content={title(data)} />
            <Meta property="og:description" content={data.body || ''} />
            <Meta
              property="og:image"
              content={createImageURL(`post.note.thumbnail.${data.id}`, 'ogp')}
            />
            <Meta name="twitter:card" content="summary_large_image" />
            <Meta name="note:card" content="summary_large_image" />
          </>
          <Show when={!isServer || !isTwitterBot()}>
            <NotePostView post={data} />
          </Show>
        </>
      )}
    </Show>
  )
}
