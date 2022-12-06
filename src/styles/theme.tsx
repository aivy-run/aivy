import Color from 'color'
import cookie from 'cookie'
import dayjs from 'dayjs'
import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  JSX,
  onMount,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import { useRequest } from 'solid-start/server'
import { ThemeProvider as _ThemeProvider, useTheme } from 'solid-styled-components'

import { MediaBreakpoints } from './media'

import { useBrowserSetting } from '~/hooks/use-browser-setting'

type Theme = {
  name: 'dark' | 'light'
  colors: {
    main: Color
    sub: Color
    text: Color
    bg: Color
    bg_accent: Color
  }
  media: {
    breakpoints: {
      sm: string
      md: string
      lg: string
      xl: string
    }
  }
  alias: {
    main_height: string
  }
}

export const light: Theme = {
  name: 'light',
  colors: {
    main: Color('#aed1ff'),
    sub: Color('#96c2fc'),
    text: Color('#333333'),
    bg: Color('#aed1ff'),
    bg_accent: Color('#fff'),
  },
  media: {
    breakpoints: {
      sm: `@media ${MediaBreakpoints.sm}`,
      md: `@media ${MediaBreakpoints.md}`,
      lg: `@media ${MediaBreakpoints.lg}`,
      xl: `@media ${MediaBreakpoints.xl}`,
    },
  },
  alias: {
    main_height: 'calc(100vh - (60px + 350px))',
  },
}

const dark: Theme = {
  name: 'dark',
  colors: {
    main: Color('#aed1ff'),
    sub: Color('#96c2fc'),
    text: Color('#eee'),
    bg: Color('#222'),
    bg_accent: Color('#333'),
  },
  media: {
    breakpoints: {
      sm: `@media ${MediaBreakpoints.sm}`,
      md: `@media ${MediaBreakpoints.md}`,
      lg: `@media ${MediaBreakpoints.lg}`,
      xl: `@media ${MediaBreakpoints.xl}`,
    },
  },
  alias: {
    main_height: 'calc(100vh - (60px + 350px))',
  },
}

const GlobalStyles: Component = () => {
  const theme = useTheme()

  return (
    <style
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={`
        body {
          background-color: ${theme.$().colors.bg.string()};
          color: ${theme.$().colors.text.string()};
          min-height: 100vh;
        }
      `}
    />
  )
}

export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  const [theme, setTheme] = createSignal(light)
  const [setting] = useBrowserSetting()

  const prefersLight = createMemo(() => {
    if (isServer) {
      const { request } = useRequest()
      const raw = request.headers.get('cookie') || ''
      const parsed = cookie.parse(raw)
      const theme = parsed['prefers-color-scheme']
      return (setting.theme === 'system' && theme === 'light') || setting.theme === 'light'
    } else {
      return window.matchMedia('(prefers-color-scheme: light)').matches
    }
  })

  const set = () => {
    if (setting.theme === 'system') setTheme(prefersLight() ? light : dark)
    setTheme(setting.theme === 'light' ? light : dark)
  }

  const [loader] = createResource(set)
  loader()

  createEffect(() => {
    if (setting.theme === 'system') setTheme(prefersLight() ? light : dark)
    setTheme(setting.theme === 'light' ? light : dark)
  })

  onMount(() => {
    set()
    document.cookie = cookie.serialize('prefers-color-scheme', prefersLight() ? 'light' : 'dark', {
      path: '/',
      maxAge: dayjs.duration({ years: 100 }).asSeconds(),
    })
  })

  return (
    <_ThemeProvider theme={{ $: theme }}>
      <GlobalStyles />
      {props.children}
    </_ThemeProvider>
  )
}

declare module 'solid-styled-components' {
  export interface DefaultTheme {
    $: Accessor<Theme>
  }
}
