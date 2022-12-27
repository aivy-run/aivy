import {
  Accessor,
  Component,
  createContext,
  createSignal,
  JSX,
  onMount,
  useContext,
} from 'solid-js'
import { createStore, SetStoreFunction } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import { parseCookie, serializeCookie } from 'solid-start'
import { useRequest } from 'solid-start/server'

import { isValidJSON } from '~/lib/is-valid-json'
import type { BrowserSettings } from '~/types/settings'

const STORAGE_KEY = 'aivy.setting'
const COOKIE_KEY = 'aivy-browser-settings'
const DEFAULT: BrowserSettings = {
  max_resolution: {
    height: 1280,
    width: 1280,
  },
  theme: 'system',
}

const Context = createContext(
  {} as {
    setting: BrowserSettings
    setSetting: SetStoreFunction<BrowserSettings>
    loaded: Accessor<boolean>
  },
)

const saveToCookie = (raw: string) => {
  document.cookie = serializeCookie(COOKIE_KEY, raw, {
    sameSite: 'lax',
    maxAge: 100 * 365 * 24 * 60 * 60,
    path: '/',
  })
}

const load = () => {
  let stored = ''
  if (isServer) {
    const { request } = useRequest()
    const raw = request.headers.get('cookie') || ''
    const parsed = parseCookie(raw)
    stored = parsed[COOKIE_KEY] || ''
  } else {
    stored = localStorage.getItem(STORAGE_KEY) || ''
  }
  if (!stored || !isValidJSON(stored)) {
    stored = JSON.stringify(DEFAULT)
    if (!isServer) {
      localStorage.setItem(STORAGE_KEY, stored)
      saveToCookie(stored)
    }
  }
  return JSON.parse(stored) as BrowserSettings
}

export const useBrowserSetting = () => {
  const { setting, setSetting, loaded } = useContext(Context)

  const save = () => {
    const str = JSON.stringify({ ...setting })
    localStorage.setItem(STORAGE_KEY, str)
    saveToCookie(str)
  }

  return [setting, setSetting, save, loaded] as const
}

export const BrowserSettingProvider: Component<{ children: JSX.Element }> = (props) => {
  const [setting, setSetting] = createStore(load())
  const [loaded, setLoaded] = createSignal(false)

  onMount(() => {
    setSetting(load())
    setLoaded(true)
  })

  return (
    <Context.Provider value={{ setting, setSetting, loaded }}>{props.children}</Context.Provider>
  )
}
