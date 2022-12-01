import { Component, createSignal, onMount, Show } from 'solid-js'

import { Button } from '~/components/ui/button'
import { Fallback } from '~/components/ui/fallback'
import { UserList } from '~/components/user-list'
import { api } from '~/lib/api/supabase'
import type { RelationShipFilter } from '~/lib/api/supabase/relationship'
import type { UserProfile, UserFilter } from '~/lib/api/supabase/user'

const I = 50

export const RelationShipsList: Component<{
  user: UserProfile['Row']
  type: 'follows' | 'followers'
}> = (props) => {
  const [followers, setFollowers] = createSignal<UserProfile['Row'][]>([])

  const [page, setPage] = createSignal(1)
  const [complete, setComplete] = createSignal(false)
  const [firstLoad, setFirstLoad] = createSignal(true)
  const [loading, setLoading] = createSignal(true)

  const fetchFollowers = async (page: number) => {
    setLoading(true)
    const relationshipFilter: Partial<RelationShipFilter> = {
      limit: I,
      since: I * (page - 1),
      latest: true,
    }
    if (props.type === 'follows') relationshipFilter.authors = [props.user.uid]
    else relationshipFilter.targets = [props.user.uid]
    const relationships = await api.relationship.getRelationships(relationshipFilter)
    if (relationships.length < I) setComplete(true)
    if (relationships.length < 1) return setFirstLoad(false)

    const userFilter: Partial<UserFilter> = {}
    if (props.type === 'follows') userFilter.uids = relationships.map((u) => u.target)
    else userFilter.uids = relationships.map((u) => u.uid)
    const users = await api.user.list(userFilter)
    setFollowers((prev) => [...prev, ...users])
    setFirstLoad(false)
    setLoading(false)
  }

  onMount(() => fetchFollowers(page()))

  return (
    <div>
      <Show when={!firstLoad()} fallback={<Fallback height="auto" />}>
        <UserList users={followers()} />
        <Show when={!complete()}>
          <Button
            loading={loading()}
            onClick={() => {
              const next = page() + 1
              fetchFollowers(next)
              setPage(next)
            }}
          >
            さらに読み込む
          </Button>
        </Show>
      </Show>
    </div>
  )
}
