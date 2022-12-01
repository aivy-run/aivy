import { Component, JSX, Show } from 'solid-js'
import { A } from 'solid-start'
import { styled } from 'solid-styled-components'

import { Button } from './ui/button'

import { useURLSearchParams } from '~/hooks/use-search-params'

const Container = styled.div`
  display: flex;
  width: 100%;
  height: ${(p) => p.theme?.$().alias.main_height};
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const Maintenance: Component<{ children: JSX.Element }> = (props) => {
  const params = useURLSearchParams('bypass')
  return (
    <Show when={!(true || import.meta.env.DEV)} fallback={<>{props.children}</>}>
      <Container>
        <h1>現在メンテナンス中です。</h1>
        <p>詳細はDiscordサーバーにてご確認ください。</p>
        <A href="https://discord.gg/9NqyGWHHQu" target="_blank">
          <Button>Discordに参加</Button>
        </A>
      </Container>
    </Show>
  )
}
