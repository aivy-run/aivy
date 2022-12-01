import cookie from 'cookie'
import { createEffect, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { isServer } from 'solid-js/web'
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

const saveToCookie = (raw: string) => {
  document.cookie = cookie.serialize(COOKIE_KEY, raw, {
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
    const parsed = cookie.parse(raw)
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
  const [store, setStore] = createStore(load())
  const [loaded, setLoaded] = createSignal(false)

  const save = () => {
    const str = JSON.stringify({ ...store })
    localStorage.setItem(STORAGE_KEY, str)
    saveToCookie(str)
  }
  createEffect(() => {
    setStore(load())
    setLoaded(true)
  })

  return [store, setStore, save, loaded] as const
}
