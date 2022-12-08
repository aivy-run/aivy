import { Component, createMemo, For, Show } from 'solid-js'
import { A } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { Button } from './button'

import IconLeft from '~icons/carbon/chevron-left'
import IconRight from '~icons/carbon/chevron-right'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  user-select: none;
`

const IconButton = styled(Button)`
  padding: 0;

  div {
    width: 50px;
    height: 50px;
  }
`

const numToArr = (num: number) => {
  const result: number[] = []
  for (let v = 1; v <= num; v++) {
    result.push(v)
  }
  return result
}

const numEqualsOr = (num: number, ...others: number[]) => {
  for (const v of others) if (num === v) return true
  return false
}

export const Pagination: Component<{
  count: number
  current: number
  url?: ((index: number) => string) | string
  onClick?: (page: number) => void
  key?: string
  noScroll?: boolean
}> = (props) => {
  const theme = useTheme()
  const key = createMemo(() => props.key || 'page')
  return (
    <Container>
      <Show when={props.current > 1}>
        <A
          class={css`
            display: none;
            ${theme.$().media.breakpoints.lg} {
              display: block;
            }
          `}
          href={
            typeof props.url === 'string'
              ? `${props.url}?${key()}=${props.current - 1}`
              : props.url?.(props.current - 1) || ''
          }
          noScroll={!!props.noScroll}
          onClick={(e) => {
            if (!props.onClick) return
            e.preventDefault()
            props.onClick(props.current - 1)
          }}
        >
          <IconButton>
            <IconLeft />
          </IconButton>
        </A>
      </Show>
      <For each={numToArr(props.count)}>
        {(page) => {
          return (
            <>
              <Show
                when={props.count > 3 && page === props.count && props.current < props.count - 2}
              >
                <p>...</p>
              </Show>
              <Show
                when={numEqualsOr(
                  page,
                  1,
                  props.count,
                  props.current - 1,
                  props.current,
                  props.current + 1,
                )}
              >
                <A
                  class={css`
                    display: inline-flex;
                    width: 35px;
                    height: 35px;
                    align-items: center;
                    justify-content: center;
                    border: 1.5px solid ${theme.$().colors.text.string()};
                    border-radius: 0.25rem;
                    background-color: ${page === props.current
                      ? theme.$().colors.bg.darken(0.25).string()
                      : theme.$().colors.bg.lighten(0.75).string()};
                    color: ${page === props.current ? 'white' : theme.$().colors.text.string()};
                    font-size: 1rem;
                    font-weight: 400;
                  `}
                  href={
                    typeof props.url === 'string'
                      ? `${props.url}?${key()}=${page}`
                      : props.url?.(page) || ''
                  }
                  noScroll={!!props.noScroll}
                  onClick={(e) => {
                    if (!props.onClick) return
                    e.preventDefault()
                    props.onClick(page)
                  }}
                >
                  <p>{page}</p>
                </A>
              </Show>

              <Show when={props.count > 3 && page === 1 && props.current > 3}>
                <p>...</p>
              </Show>
            </>
          )
        }}
      </For>
      <Show when={props.current < props.count}>
        <A
          class={css`
            display: none;
            ${theme.$().media.breakpoints.lg} {
              display: block;
            }
          `}
          href={
            typeof props.url === 'string'
              ? `${props.url}?${key()}=${props.current + 1}`
              : props.url?.(props.current + 1) || ''
          }
          noScroll={!!props.noScroll}
          onClick={(e) => {
            if (!props.onClick) return
            e.preventDefault()
            props.onClick(props.current + 1)
          }}
        >
          <IconButton>
            <IconRight />
          </IconButton>
        </A>
      </Show>
    </Container>
  )
}
