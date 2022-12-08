import { A, useSearchParams } from '@solidjs/router'
import { Component, ComponentProps, createMemo, For, JSX, Show } from 'solid-js'
import { useLocation } from 'solid-start'
import { css, styled } from 'solid-styled-components'

import { Posts } from './posts'

import { Tab, Tabs } from '~/components/ui/tab'

const Inner = styled.div`
  padding: 1rem 2rem;
  border-radius: 1rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
`

type PropsT = {
  options: (ComponentProps<typeof Posts> & {
    type: string
    render?: (() => JSX.Element) | undefined
  })[]
  heading?: string
  index: string
  children?: JSX.Element
}

export const PostsWithSorter: Component<PropsT> = (props) => {
  const [search] = useSearchParams<{ t: string }>()
  const location = useLocation()

  const type = createMemo(() => search.t || props.index)
  const url = (...query: [string, string][]) => {
    const params = new URLSearchParams(location.search)
    for (const q of query) params.set(...q)
    const str = params.toString()
    return `${location.pathname}${str ? `?${str}` : ''}`
  }

  return (
    <>
      <Inner
        class={css`
          h1 {
            margin-bottom: 0.5rem;
            font-size: 1.15rem;
          }
        `}
      >
        <Show when={props.heading}>
          <h1>{props.heading}</h1>
        </Show>
        <Tabs>
          <For each={props.options}>
            {(option) => (
              <Tab selected={type() === option.type}>
                <A href={url(['t', option.type])}>{option.title}</A>
              </Tab>
            )}
          </For>
        </Tabs>
      </Inner>
      <br />
      {props.children}
      <For each={props.options}>
        {(option) => {
          if (!option.url) option.url = (page) => url(['page', `${page}`])
          return (
            <Show when={type() === option.type}>
              <Inner>
                <Show when={!option.render} fallback={option.render!()}>
                  <Posts {...option} />
                </Show>
              </Inner>
            </Show>
          )
        }}
      </For>
    </>
  )
}
