import { styled } from 'decorock'
import type { Component, JSX } from 'solid-js'
import { A, Outlet, useLocation } from 'solid-start'

import { FixedTitle } from '~/components/head/title'
import { Tab, Tabs } from '~/components/ui/tab'
import { WithUser } from '~/components/with-user'

const Container = styled(WithUser)`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Inner = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
  border-top: solid 1.5px ${(p) => p.theme.colors.text.fade(0.5)};
  margin: 0;
  background-color: ${(p) => p.theme.colors.bg_accent};

  ${(p) => p.theme.media.breakpoints.lg} {
    width: 70%;
    height: 100%;
    min-height: auto;
    border-radius: 1rem;
    border-top: none;
    margin: 2rem 1rem;
  }
`

const LinkTab: Component<{ href: string; children: JSX.Element }> = (props) => {
  const location = useLocation()
  return (
    <Tab selected={location.pathname === props.href}>
      <A href={props.href}>{props.children}</A>
    </Tab>
  )
}

export default function Settings() {
  return (
    <>
      <FixedTitle>設定 | Aivy</FixedTitle>
      <Container redirectWhenGuest>
        <Inner>
          <h1>設定</h1>
          <br />
          <Tabs>
            <LinkTab href="/settings/account">アカウント</LinkTab>
            <LinkTab href="/settings/profile">プロフィール</LinkTab>
            <LinkTab href="/settings/browser">ブラウザ設定</LinkTab>
          </Tabs>
          <br />
          <Outlet />
        </Inner>
      </Container>
    </>
  )
}
