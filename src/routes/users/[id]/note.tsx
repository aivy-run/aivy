import { useContext } from 'solid-js'

import { UserContext } from '../[id]'

import { Notes } from '~/components/note-list/notes'

const I = 20

export default function Note() {
  const { user } = useContext(UserContext)

  return (
    <Notes
      all={I}
      url={`/users/${user.id}`}
      filter={{
        author: [user.uid],
        latest: true,
      }}
    />
  )
}
