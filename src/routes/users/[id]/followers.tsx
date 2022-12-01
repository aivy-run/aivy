import { useContext } from 'solid-js'

import { UserContext } from '../[id]'

import { RelationShipsList } from '~/components/relationship-list'

export default function Followers() {
  const { user } = useContext(UserContext)

  return (
    <>
      <RelationShipsList user={user} type="followers" />
    </>
  )
}
