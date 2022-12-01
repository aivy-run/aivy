import { A, Outlet, useLocation } from 'solid-start'
import { styled } from 'solid-styled-components'

import { FixedTitle } from '~/components/head/title'
import { Tab, Tabs } from '~/components/ui/tab'
import { WithUser } from '~/components/with-user'

const Container = styled(WithUser)`
  min-height: 100%;
  padding: 1rem;
  border-radius: 0;
  margin: 0;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  ${(p) => p.theme?.$().media.breakpoints.lg} {
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
        <Tabs>
          <Tab selected={location.pathname === '/dashboard/images'}>
            <A href="/dashboard/images">画像管理</A>
          </Tab>
          <Tab selected={location.pathname === '/dashboard/bookmarks'}>
            <A href="/dashboard/bookmarks">ブックマーク</A>
          </Tab>
        </Tabs>
        <br />
        <Outlet />
      </Container>
    </>
  )
}
