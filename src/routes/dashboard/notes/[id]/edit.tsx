import { createMemo } from 'solid-js'
import { useParams } from 'solid-start'

import { NotePostForm } from '~/components/note-post-form'

export default function Edit() {
  const params = useParams()
  const id = createMemo(() => parseInt(params['id'] || ''))
  return <NotePostForm id={id()} />
}
