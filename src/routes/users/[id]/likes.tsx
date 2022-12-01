import { useContext } from 'solid-js'

import { UserContext } from '../[id]'

import { Posts } from '~/components/gallery/posts'
import { api } from '~/lib/api/supabase'

export default function Likes() {
  const { user } = useContext(UserContext)

  return (
    <Posts
      all={20}
      url={`/users/${user.id}/likes`}
      // eslint-disable-next-line solid/reactivity
      fetchPosts={async (all, page) => {
        const count = await api.like.count({
          author: user.uid,
        })
        const likes = await api.like.list({
          type: 'image_post',
          author: user.uid,
          limit: all,
          since: all * (page - 1),
        })
        const posts =
          likes.length > 0
            ? await api.image.list(all, undefined, false, {
                latest: true,
                ids: likes.map((v) => v.target),
              })
            : []
        return {
          posts,
          page,
          count,
        }
      }}
    />
  )
}
