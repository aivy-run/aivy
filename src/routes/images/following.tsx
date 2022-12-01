import { createEffect, createSignal } from 'solid-js'

import { PostContainer } from '~/components/gallery/post-container'
import { Posts } from '~/components/gallery/posts'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'

export default function Latest() {
  const {
    util: { withUser },
  } = useUser(true)
  const [following, setFollowing] = createSignal([] as string[])

  createEffect(() => {
    withUser(async ([, profile]) => {
      const relationships = await api.relationship.getRelationships({ authors: [profile.uid] })
      setFollowing(relationships.map((v) => v.target))
    })
  })

  return (
    <PostContainer>
      <Posts
        title="フォロー中"
        all={50}
        url="/images/following"
        filter={{
          authorOr: following(),
        }}
      />
    </PostContainer>
  )
}
