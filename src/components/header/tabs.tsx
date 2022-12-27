import { css, styled, useTheme } from 'decorock'
import { Component, JSX, Show } from 'solid-js'
import { A, useLocation } from 'solid-start'

const FallBack = styled.div`
  position: relative;
  z-index: 5;
  height: 0;
  border-bottom: solid 1px ${(p) => p.theme.colors.text.fade(0.5)};
  margin-bottom: -1px;
`

const Container = styled.div`
  position: sticky;
  z-index: 5;
  top: 0;
  padding: 0 1rem;
  border-bottom: solid 1px ${(p) => p.theme.colors.text.fade(0.5)};
  background-color: ${(p) => p.theme.colors.bg_accent};
  ${(p) => p.theme.media.breakpoints.md} {
    padding: 0 4rem;
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
`

const Tab: Component<{ href: string; selected: boolean; children: JSX.Element }> = (props) => {
  const theme = useTheme()
  return (
    <A
      href={props.href}
      class={css`
        position: relative;
        height: 100%;
        padding: 0.5rem 0;
        color: ${props.selected ? theme.colors.text : theme.colors.text.fade(0.5)};
        font-weight: bold;
        transition: 0.5s;

        &::before {
          position: absolute;
          z-index: 1;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${props.selected ? theme.colors.main.darken(0.1) : 'transparent'};
          content: '';
        }

        &:hover {
          color: ${theme.colors.text};
        }
      `}
    >
      <div>{props.children}</div>
    </A>
  )
}

const SHOW_PATHNAME = [
  '/',
  '/contests/list',
  '/search',
  '/images/latest',
  '/images/following',
  '/images/ranking',
]

export const HeaderTabs: Component = () => {
  const location = useLocation()

  return (
    <Show when={SHOW_PATHNAME.includes(location.pathname)} fallback={<FallBack />}>
      <Container>
        <Tabs>
          <Tab
            href="/"
            selected={location.pathname === '/' || location.pathname.startsWith('/images')}
          >
            Images
          </Tab>
          <Tab href="/search" selected={location.pathname === '/search'}>
            Search
          </Tab>
          <Tab href="/contests/list" selected={location.pathname === '/contests'}>
            Contests
          </Tab>
        </Tabs>
      </Container>
    </Show>
  )
}
