import type { Session, User } from '@supabase/supabase-js'
import dayjs from 'dayjs'
import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  JSX,
  onMount,
  Resource,
  useContext,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import { parseCookie, serializeCookie, useNavigate, useServerContext } from 'solid-start'

import { api } from '~/lib/api/supabase'
import { createSupabaseInstance, supabase } from '~/lib/api/supabase/client'
import type { UserProfile } from '~/lib/api/supabase/user'

const UserContext = createContext(
  {} as {
    isFetching: Accessor<boolean>
    user: Resource<User | null>
    profile: Resource<UserProfile['Row'] | undefined>
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
  const sb = isServer ? createSupabaseInstance() : supabase

  const event = useServerContext()
  const cookie = () =>
    parseCookie(isServer ? event.request.headers.get('cookie') || '' : document.cookie)
  const accessToken = createMemo(() => cookie()['aivy-access-token'])
  const refreshToken = createMemo(() => cookie()['aivy-refresh-token'])
  const [isFetching, setIsFetching] = createSignal(true)
  const navigate = useNavigate()

  const fetchUser = async () => {
    let session: Session | null = null
    let user: User | null = null
    const access_token = accessToken()
    const refresh_token = refreshToken()
    if (access_token && refresh_token) {
      const { data } = await sb.auth.setSession({
        access_token,
        refresh_token,
      })
      user = data.user
      session = data.session
    } else {
      const { data } = await sb.auth.getUser()
      user = data.user
    }
    if (isServer) {
      const expire = dayjs().toDate()
      const eternity = dayjs.duration({ years: 100 }).asSeconds()
      const secure = import.meta.env.DEV ? false : true
      event.responseHeaders.append(
        'Set-Cookie',
        serializeCookie(`aivy-access-token`, session?.access_token || '', {
          secure,
          expires: session ? undefined : expire,
          maxAge: session ? eternity : undefined,
          sameSite: 'lax',
          path: '/',
        }),
      )
      event.responseHeaders.append(
        'Set-Cookie',
        serializeCookie(`aivy-refresh-token`, session?.refresh_token || '', {
          secure,
          expires: session ? undefined : expire,
          maxAge: session ? eternity : undefined,
          sameSite: 'lax',
          path: '/',
        }),
      )
    }
    if (!user) setIsFetching(false)
    return user
  }
  const [user, { mutate: mutateUser }] = createResource(fetchUser)
  onMount(() => fetchUser().then(mutateUser))

  const fetchProfile = async (id: string) => {
    if (!id) return
    const profile = await api.user.get(id)
    if (!profile) {
      setIsFetching(false)
      navigate('/setup')
      return
    }
    setIsFetching(false)
    return profile
  }

  const [profile, { mutate: mutateProfile }] = createResource(() => user()?.id, fetchProfile)
  createEffect(() => {
    if (user() && isFetching()) fetchProfile(user()!.id).then(mutateProfile)
  })

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
    mutateProfile(data)
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
