import { css, styled } from 'decorock'
import { Show } from 'solid-js'
import { A, Outlet, useLocation } from 'solid-start'

import { FixedTitle } from '~/components/head/title'
import { Tab, Tabs } from '~/components/ui/tab'
import { WithUser } from '~/components/with-user'

const Container = styled(WithUser)`
  min-height: 100%;
  padding: 1rem;
  border-radius: 0;
  margin: 0;
  background-color: ${(p) => p.theme.colors.bg_accent};
  ${(p) => p.theme.media.breakpoints.lg} {
    min-height: auto;
    padding: 2rem;
    border-radius: 1rem;
    margin: 2rem;
  }
`

export default function DashBoard() {
  const location = useLocation()
  return (
    <>
      <FixedTitle>ダッシュボード | Aivy</FixedTitle>
      <Container redirectWhenGuest>
        <Show when={location.pathname.split('/').length < 4}>
          <h1>ダッシュボード</h1>
          <br />
          <Tabs
            class={css`
              margin-bottom: 0.5rem;
            `}
          >
            <Tab selected={location.pathname === '/dashboard/images'}>
              <A href="/dashboard/images">画像管理</A>
            </Tab>
            <Tab selected={location.pathname === '/dashboard/notes'}>
              <A href="/dashboard/notes">ノート管理</A>
            </Tab>
          </Tabs>
        </Show>
        <Outlet />
      </Container>
    </>
  )
}
