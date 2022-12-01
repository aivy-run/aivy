import { createEffect, createSignal, Show, useContext } from 'solid-js'

import { UserContext } from '../[id]'

import { Button } from '~/components/ui/button'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'

export default function Others() {
  const {
    status: { isGuest },
    util: { withUser },
  } = useUser(true)
  const { user, isMyPage } = useContext(UserContext)
  const [muted, setMuted] = createSignal<boolean>()

  createEffect(() => {
    withUser(async ([, profile]) => {
      const mutes = await api.mute.list(profile.uid)
      setMuted(mutes.findIndex((v) => v.target === user.uid) !== -1)
    })
  })

  return (
    <div>
      <Show when={!isMyPage() && !isGuest()}>
        <Button
          onClick={async () => {
            withUser(
              async ([me], muted) => {
                if (muted) await api.mute.remove(user.uid)
                else await api.mute.add(user.uid, me.id)
                setMuted(!muted)
              },
              null,
              muted,
            )
          }}
        >
          <Show when={muted()} fallback={`このユーザーをミュート`}>
            ミュートを解除
          </Show>
        </Button>
      </Show>
    </div>
  )
}
