import { createEffect, createSignal, Show } from 'solid-js'

import { PostContainer } from '~/components/gallery/post-container'
import { Posts } from '~/components/gallery/posts'
import { Fallback } from '~/components/ui/fallback'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'

export default function Latest() {
  const {
    util: { withUser },
  } = useUser(true)
  const [loading, setLoading] = createSignal(true)
  const [following, setFollowing] = createSignal([] as string[])

  createEffect(() => {
    withUser(async ([, profile]) => {
      const relationships = await api.relationship.getRelationships({ authors: [profile.uid] })
      setFollowing(relationships.map((v) => v.target))
      setLoading(false)
    })
  })

  return (
    <PostContainer>
      <Show when={!loading()} fallback={<Fallback height="auto" />}>
        <Show
          when={following().length}
          fallback={
            <>
              <h1>誰もフォローしていません</h1>
            </>
          }
        >
          <Posts
            title="フォロー中"
            all={50}
            url="/images/following"
            filter={{
              authorOr: following(),
            }}
          />
        </Show>
      </Show>
    </PostContainer>
  )
}
