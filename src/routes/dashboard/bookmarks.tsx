import { Posts } from '~/components/gallery/posts'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'

export default function Bookmarks() {
  const {
    util: { withUser },
  } = useUser()

  return (
    <Posts
      all={20}
      url="/dashboard/bookmarks"
      fetchPosts={(all, page) => {
        return withUser(async ([me]) => {
          const count = await api.bookmark.count({
            author: me.id,
          })
          const bookmarks = await api.bookmark.list({
            author: me.id,
            limit: all,
            since: all * (page - 1),
          })
          const posts =
            bookmarks.length > 0
              ? await api.image.list(all, undefined, false, {
                  ids: bookmarks.map((v) => v.target),
                })
              : []
          return {
            posts,
            page,
            count,
          }
        })!
      }}
    />
  )
}
