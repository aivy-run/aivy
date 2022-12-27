import Color from 'color'
import dayjs from 'dayjs'
import { css, styled, useTheme } from 'decorock'
import { Component, createEffect, createMemo, createSignal, onMount, Show } from 'solid-js'

import { CheckBox } from '../ui/checkbox'

import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'

const Container = styled.div``

const Item = styled.div<{ selected: boolean }>`
  display: grid;
  padding: 0.5rem;
  border: solid 1px ${(p) => p.theme.colors.main.fade(p.selected ? 0.25 : 0.8)};
  border-radius: 1rem;
  cursor: pointer;
  gap: 1rem;
  grid-template-columns: 100px 1fr;

  & > div {
    text-align: left;
  }
`

const AINetaContest: Component<{ onSelect: (select: boolean) => void; posted: boolean }> = (
  props,
) => {
  const theme = useTheme()
  const [checked, setChecked] = createSignal(false)
  createEffect(() => props.onSelect(checked()))
  return (
    <Item
      class={css`
        color: ${props.posted ? theme.colors.text.fade(0.25) : 'inherit'};
      `}
      selected={checked()}
      onClick={() => {
        if (props.posted) return
        setChecked(!checked())
      }}
    >
      <CheckBox
        checked={checked()}
        onClick={(e) => {
          if (props.posted) e.preventDefault()
        }}
      />
      <div>
        <h2>「AIネタ画像コンテスト」に参加する</h2>
        <p>
          その名の通り、AIでネタ画像を生成して面白さを競うコンテストです。
          <br />
          さらに、作品を鑑賞する方々にも受賞のチャンスが！
        </p>
        <Show when={props.posted}>
          <br />
          <div
            class={css`
              color: ${Color('red').lighten(0.25)};
            `}
          >
            今日はすでに投稿しています。
          </div>
        </Show>
      </div>
    </Item>
  )
}

export const ContestSelect: Component<{
  onSelect: (id?: number) => void
}> = (props) => {
  const {
    accessor: [me],
  } = useUser()
  const [pending, setPending] = createSignal(true)
  const [posted, setPosted] = createSignal<boolean>()
  const today = createMemo(() => dayjs(dayjs().format('YYYY-MM-DD')))
  onMount(() => {
    api.image
      .list(1, undefined, false, {
        author: [me().id],
        contest_id: 1,
        build(builder) {
          builder.gte('created_at', dayjs(today()).format())
        },
      })
      .then((v) => {
        setPosted(v.length > 0)
        setPending(false)
      })
  })
  return (
    <Container
      class={css`
        opacity: ${pending() ? '0' : '1'};
        transition: 0.2s;
      `}
    >
      <AINetaContest onSelect={(bool) => props.onSelect(bool ? 1 : 0)} posted={!!posted()} />
    </Container>
  )
}
