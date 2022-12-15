import { createMemo, createResource, Show } from 'solid-js'
import { useParams } from 'solid-start'

import { NotFoundError } from '~/components/error-handler'
import { NotePostView } from '~/components/note-post'
import { api } from '~/lib/api/supabase'

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
  return (
    <Show when={data()} keyed>
      {(data) => <NotePostView post={data} />}
    </Show>
  )
}
