import Color from 'color'
import dayjs from 'dayjs'
import { type DefaultTheme, createThemeStore, DecoRockProvider, useTheme } from 'decorock'
import { Component, createEffect, createMemo, JSX, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'
import { parseCookie, serializeCookie, useServerContext } from 'solid-start'

import { MediaBreakpoints } from './media'

import { useBrowserSetting } from '~/hooks/use-browser-setting'

declare module 'decorock' {
  export interface DefaultTheme {
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
}

export const light: DefaultTheme = {
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

const dark: DefaultTheme = {
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
          background-color: ${theme.colors.bg};
          color: ${theme.colors.text};
          min-height: 100vh;
        }
      `}
    />
  )
}

export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  const [theme, setTheme] = createThemeStore({ ...light })
  const [setting] = useBrowserSetting()
  const event = useServerContext()

  const prefersLight = createMemo(() => {
    const cookie = parseCookie(
      isServer ? event.request.headers.get('cookie') || '' : document.cookie,
    )
    const prefers = cookie['prefers-color-scheme']
    return isServer
      ? (setting.theme === 'system' && prefers === 'light') || setting.theme === 'light'
      : window.matchMedia('(prefers-color-scheme: light)').matches
  })

  const set = () => {
    if (setting.theme === 'system') setTheme(prefersLight() ? light : dark)
    setTheme(setting.theme === 'light' ? light : dark)
  }
  // eslint-disable-next-line solid/reactivity
  set()

  createEffect(() => {
    setTheme({
      ...(setting.theme === 'system'
        ? prefersLight()
          ? light
          : dark
        : setting.theme === 'light'
        ? light
        : dark),
    })
  })

  onMount(() => {
    set()
    document.cookie = serializeCookie('prefers-color-scheme', prefersLight() ? 'light' : 'dark', {
      path: '/',
      maxAge: dayjs.duration({ years: 100 }).asSeconds(),
    })
  })

  return (
    <DecoRockProvider theme={theme} build={(p) => (p?.string ? p : p)}>
      <GlobalStyles />
      {props.children}
    </DecoRockProvider>
  )
}
