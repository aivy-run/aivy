import { useContext } from 'solid-js'

import { UserContext } from '../[id]'

import { Posts } from '~/components/gallery/posts'

const I = 20

export default function User() {
  const { user } = useContext(UserContext)

  return (
    <Posts
      all={I}
      url={`/users/${user.id}`}
      bypassMute={true}
      filter={{
        author: [user.uid],
        latest: true,
      }}
    />
  )
}
