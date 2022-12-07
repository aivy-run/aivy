import { Component, createMemo, createSignal, Show } from 'solid-js'
import { A } from 'solid-start'
import { css, styled } from 'solid-styled-components'

import { Button } from './ui/button'
import { useModal } from './ui/modal'
import { HStack } from './ui/stack'
import { Tab, Tabs } from './ui/tab'

import { useUser } from '~/context/user'
import type { Zoning } from '~/lib/api/supabase/user'

const Container = styled.div`
  padding: 1rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
`

const Navigate: Component<{
  close: () => void
  zoning: Zoning
  isGuest: boolean
}> = (props) => {
  const title = createMemo(() => (props.zoning === 'r18' ? 'R-18' : 'R-18G'))
  return (
    <div class={css``}>
      <h1>{title()}作品は表示できません</h1>
      <Show
        when={!props.isGuest}
        fallback={
          <>
            <div>表示するにはアカウント登録が必要です。</div>
            <HStack>
              <A href="/settings/account" onClick={() => props.close()}>
                <Button>ログイン</Button>
              </A>
              <Button onClick={() => props.close()}>閉じる</Button>
            </HStack>
          </>
        }
      >
        <div>アカウント設定を確認してください。</div>
        <HStack>
          <A href="/settings/account" onClick={() => props.close()}>
            <Button>アカウント設定へ</Button>
          </A>
          <Button onClick={() => props.close()}>閉じる</Button>
        </HStack>
      </Show>
    </div>
  )
}

export const ZoningSelector: Component<{
  onChange: (value: Zoning[]) => void
}> = (props) => {
  const {
    accessor: [, profile],
    status: { isGuest },
  } = useUser(true)
  const modal = useModal()
  const [current, setCurrent] = createSignal<Zoning | 'all'>('normal')
  const all = createMemo(() => (profile()?.zoning || ['normal']) as Zoning[])

  const set = (zoning: Zoning | 'all') => {
    switch (zoning) {
      case 'all':
        props.onChange(all())
        break
      case 'normal':
        props.onChange(['normal'])
        break
      case 'r18':
        if (isGuest() || !profile()?.zoning.includes('r18')) {
          modal({
            render: (close) => <Navigate isGuest={isGuest()} close={close} zoning="r18" />,
          })
          return
        }
        props.onChange(['r18'])
        break
      case 'r18g':
        if (isGuest() || !profile()?.zoning.includes('r18g')) {
          modal({
            render: (close) => <Navigate isGuest={isGuest()} close={close} zoning="r18g" />,
          })
          return
        }
        props.onChange(['r18g'])
        break
    }
    setCurrent(zoning)
  }
  return (
    <Container>
      <Tabs>
        <Tab selected={current() === 'all'} onClick={() => set('all')}>
          すべて
        </Tab>
        <Tab selected={current() === 'normal'} onClick={() => set('normal')}>
          全年齢
        </Tab>
        <Tab selected={current() === 'r18'} onClick={() => set('r18')}>
          R-18
        </Tab>
        <Tab selected={current() === 'r18g'} onClick={() => set('r18g')}>
          R-18G
        </Tab>
      </Tabs>
    </Container>
  )
}
