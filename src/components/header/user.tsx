import { A } from '@solidjs/router'
import type { Component } from 'solid-js'
import { css, styled, useTheme } from 'solid-styled-components'

import { Button } from '../ui/button'
import { WithUser } from '../with-user'
import { Menu } from './menu'
import { Notifications } from './notifications'

import IconSearch from '~icons/carbon/search'

const Container = styled.div`
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  img {
    width: auto;
    height: 80%;
    border: 0.5px gray solid;
    border-radius: 50%;
    aspect-ratio: 1/1;
    cursor: pointer;
  }
`

export const User: Component = () => {
  const theme = useTheme()

  return (
    <Container>
      <A
        class={css`
          display: flex;
          align-items: center;
          color: ${theme.$().colors.text.string()};
        `}
        href="/search"
      >
        <IconSearch width={25} height={25} />
      </A>
      <WithUser
        class={css`
          display: flex;
          height: 100%;
          align-items: center;
          gap: 1rem;
        `}
        fallback={
          <A href="/sign">
            <Button
              class={css`
                padding: 0.75rem 1rem;

                a {
                  color: ${theme.$().colors.text.string()};
                }
              `}
            >
              <h5>ログイン</h5>
            </Button>
          </A>
        }
      >
        <Notifications />
        <A
          href="/upload"
          class={css`
            display: none;
            ${theme.$().media.breakpoints.md} {
              display: block;
            }
          `}
        >
          <Button>
            <h5>画像を投稿</h5>
          </Button>
        </A>
        <Menu />
      </WithUser>
    </Container>
  )
}
