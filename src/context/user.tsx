import type { User } from '@supabase/supabase-js'
import dayjs from 'dayjs'
import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createSignal,
  JSX,
  on,
  onMount,
  useContext,
} from 'solid-js'
import { useNavigate } from 'solid-start'

import { api } from '~/lib/api/supabase'
import { supabase } from '~/lib/api/supabase/client'
import type { UserProfile } from '~/lib/api/supabase/user'

const UserContext = createContext(
  {} as {
    isFetching: Accessor<boolean>
    user: Accessor<User | undefined>
    profile: Accessor<UserProfile['Row'] | undefined>
    update: (updates: Partial<UserProfile['Row']>) => void | Promise<void>
  },
)

export const useUser = <I extends boolean = false>(ignore?: I) => {
  const { isFetching, user, profile, update } = useContext(UserContext)
  const isGuest = () => !(profile?.() && user?.())
  const navigate = useNavigate()

  if (!ignore && isGuest()) {
    navigate('/sign', { replace: true })
  }

  const withUser = <R, F, A>(
    fn: (accessors: [User, UserProfile['Row']], args: A) => R,
    fallback?: (() => F) | null,
    args?: () => A,
  ): R | F | void => {
    if (isGuest()) return fallback?.()
    return fn([user()!, profile()!], args?.() as A)
  }

  return {
    status: { isFetching, isGuest },
    setter: [update],
    accessor: [
      user as Accessor<I extends false ? User : User | undefined>,
      profile as Accessor<I extends false ? UserProfile['Row'] : UserProfile['Row'] | undefined>,
    ],
    util: { withUser },
  } as const
}

export const UserProvider: Component<{ children: JSX.Element }> = (props) => {
  const [isFetching, setIsFetching] = createSignal(true)
  const [user, setUser] = createSignal<User>()
  const [profile, setProfile] = createSignal<UserProfile['Row']>()
  const navigate = useNavigate()

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) setIsFetching(false)
    return data.user
  }
  onMount(() => fetchUser().then(setUser))

  const fetchProfile = async (id: string) => {
    if (!id) return
    const profile = await api.user.get(id)
    if (!profile) {
      setIsFetching(false)
      return navigate('/setup')
    }
    setProfile(profile as UserProfile['Row'])
    setIsFetching(false)
    return profile
  }

  createEffect(
    on(user, (user) => {
      if (user) fetchProfile(user.id).then(setProfile)
    }),
  )

  const update = async (userProfile: UserProfile['Update']) => {
    const updates = {
      ...userProfile,
      updated_at: dayjs().format(),
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('uid', user()?.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
  }

  return (
    <UserContext.Provider
      value={{
        isFetching,
        user,
        profile,
        update,
      }}
    >
      {props.children}
    </UserContext.Provider>
  )
}
