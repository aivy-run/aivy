import { Component, createMemo, JSX, Show } from 'solid-js'
import { A, useLocation, useNavigate } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { useToast } from '../ui/toast'

import { allowedZoningType, setAllowedZoningType, useUser } from '~/context/user'

const FallBack = styled.div`
  position: relative;
  z-index: 5;
  height: 0;
  border-bottom: solid 1px ${(p) => p.theme?.$().colors.text.fade(0.5).string()};
  margin-bottom: -1px;
`

const Container = styled.div`
  position: sticky;
  z-index: 5;
  top: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: solid 1px ${(p) => p.theme?.$().colors.text.fade(0.5).string()};
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  ${(p) => p.theme?.$().media.breakpoints.md} {
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
        color: ${props.selected
          ? theme.$().colors.text.string()
          : theme.$().colors.text.fade(0.5).string()};
        font-weight: bold;
        transition: 0.5s;

        &::before {
          position: absolute;
          z-index: 1;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${props.selected
            ? theme.$().colors.main.darken(0.1).string()
            : 'transparent'};
          content: '';
        }

        &:hover {
          color: ${theme.$().colors.text.string()};
        }
      `}
    >
      <div>{props.children}</div>
    </A>
  )
}

const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ZoningButton = styled.button<{ selected: boolean }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.25rem;
  background-color: ${(p) =>
    p.theme
      ?.$()
      .colors.sub.fade(p.selected ? 0.5 : 0.75)
      .string()};
  color: ${(p) =>
    p.theme
      ?.$()
      .colors.text.fade(p.selected ? 0 : 0.5)
      .string()};
  cursor: pointer;
  font-weight: 500;
  outline: none;
`

const SHOW_PATHNAME = [
  '/',
  '/contests/list',
  '/search',
  '/images/latest',
  '/images/following',
  '/images/ranking',
]

export const HeaderTabs: Component = () => {
  const {
    util: { withUser },
  } = useUser(true)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const r18 = createMemo(() => allowedZoningType().includes('r18'))
  const r18g = createMemo(() => allowedZoningType().includes('r18g'))

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
        <Buttons>
          <ZoningButton
            selected={r18()}
            onClick={() => {
              withUser(
                ([, profile], r18) => {
                  if (!profile.zoning.includes('r18')) {
                    return toast({
                      title: 'R-18作品は表示できません',
                      description: 'アカウント設定を確認してください',
                      status: 'error',
                      isClosable: true,
                    })
                  }
                  if (r18) setAllowedZoningType((prev) => prev.filter((v) => v !== 'r18'))
                  else setAllowedZoningType((prev) => [...prev, 'r18'])
                },
                () => navigate('/sign'),
                r18,
              )
            }}
          >
            R-18
          </ZoningButton>
          <ZoningButton
            selected={r18g()}
            onClick={() => {
              withUser(
                ([, profile], r18g) => {
                  if (!profile.zoning.includes('r18g')) {
                    return toast({
                      title: 'R-18G作品は表示できません',
                      description: 'アカウント設定を確認してください',
                      status: 'error',
                      isClosable: true,
                    })
                  }
                  if (r18g) setAllowedZoningType((prev) => prev.filter((v) => v !== 'r18g'))
                  else setAllowedZoningType((prev) => [...prev, 'r18g'])
                },
                () => navigate('/sign'),
                r18g,
              )
            }}
          >
            R-18G
          </ZoningButton>
        </Buttons>
      </Container>
    </Show>
  )
}
