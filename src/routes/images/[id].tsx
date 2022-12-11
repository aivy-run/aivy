import { createMemo, createResource, Show, Suspense } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Meta, useParams } from 'solid-start'
import { useRequest } from 'solid-start/server'

import { NotFoundError } from '~/components/error-handler'
import { FixedTitle } from '~/components/head/title'
import { ImagePostView } from '~/components/image-post'
import { useState } from '~/hooks/use-state'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteImagePost } from '~/lib/api/supabase/images'

export default function Image() {
  const state = useState()
  const params = useParams()
  const id = createMemo(() => parseInt(params['id'] as string))

  const isTwitterBot = () => {
    const { request } = useRequest()
    const agent = request.headers.get('user-agent') || ''
    return agent.toLowerCase().startsWith('twitterbot')
  }

  const [resource] = createResource(id, async (id) => {
    const stated = state().post
    if (stated) return stated
    const post = await api.image.get(id)
    if (!post) throw new NotFoundError()
    return post
  })

  const title = (post: CompleteImagePost) => {
    if (!post?.id) return ''
    const tag = post.tags.length > 0 ? `#${post.tags[0]}` : ''
    const title = post.title
    const username = post.profiles.username
    return `${tag} ${title} - ${username}`
  }

  return (
    <Suspense>
      <Show when={resource()} keyed>
        {(post) => (
          <>
            <>
              <FixedTitle>{title(post)}</FixedTitle>
              <Meta property="og:title" content={title(post)} />
              <Meta property="og:description" content={post.description || ''} />
              <Meta
                property="og:image"
                content={createImageURL(
                  `post.image.${post.id}.0`,
                  post.zoning === 'normal' ? 'ogp' : 'ogpfiltered',
                )}
              />
              <Meta name="twitter:card" content="summary_large_image" />
              <Meta name="note:card" content="summary_large_image" />
            </>
            <Show when={!isServer || !isTwitterBot()}>
              <ImagePostView post={post} />
            </Show>
          </>
        )}
      </Show>
    </Suspense>
  )
}
