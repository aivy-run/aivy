import cookie from 'cookie'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { mount, StartClient } from 'solid-start/entry-client'

import { supabase } from './lib/api/supabase/client'

import 'dayjs/locale/ja'

dayjs.locale('ja')
dayjs.extend(duration)

supabase.auth.onAuthStateChange((event, session) => {
  const secure = import.meta.env.DEV ? false : true
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    document.cookie = cookie.serialize('aivy-access-token', '', {
      expires: new Date(0),
      sameSite: 'lax',
      secure,
      path: '/',
    })
    document.cookie = cookie.serialize('aivy-refresh-token', '', {
      expires: new Date(0),
      sameSite: 'lax',
      secure,
      path: '/',
    })
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (!session) return
    const maxAge = dayjs.duration({ years: 100 }).asSeconds()
    document.cookie = cookie.serialize('aivy-access-token', session.access_token, {
      maxAge,
      sameSite: 'lax',
      secure,
      path: '/',
    })
    document.cookie = cookie.serialize('aivy-refresh-token', session.refresh_token, {
      maxAge,
      sameSite: 'lax',
      secure,
      path: '/',
    })
  }
})

mount(() => <StartClient />, document)
