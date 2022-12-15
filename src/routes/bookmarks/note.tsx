import { Notes } from '~/components/note-list/notes'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'

export default function Image() {
  const {
    util: { withUser },
  } = useUser()

  return (
    <Notes
      all={20}
      url="/bookmarks/image"
      fetchPosts={(filter) => {
        return withUser(async ([me]) => {
          const count = await api.bookmark.count({
            ...filter,
            author: me.id,
            type: 'note_post',
          })
          const bookmarks = await api.bookmark.list({
            ...filter,
            author: me.id,
            type: 'note_post',
          })
          const posts =
            bookmarks.length > 0
              ? await api.note.list({
                  limit: filter?.limit!,
                  ids: bookmarks.map((v) => v.target),
                })
              : []
          return {
            posts,
            page: filter?.since!,
            count,
          }
        })!
      }}
    />
  )
}
