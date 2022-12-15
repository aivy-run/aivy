import { A, Outlet, useLocation } from 'solid-start'
import { css, styled } from 'solid-styled-components'

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

export default function Bookmarks() {
  const location = useLocation()
  return (
    <>
      <FixedTitle>ブックマーク | Aivy</FixedTitle>
      <Container redirectWhenGuest>
        <h1>ブックマーク</h1>
        <br />
        <Tabs
          class={css`
            margin-bottom: 0.5rem;
          `}
        >
          <Tab selected={location.pathname === '/bookmarks/image'}>
            <A href="/bookmarks/image">画像</A>
          </Tab>
          <Tab selected={location.pathname === '/bookmarks/note'}>
            <A href="/bookmarks/note">ノート</A>
          </Tab>
        </Tabs>
        <Outlet />
      </Container>
    </>
  )
}
