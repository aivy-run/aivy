import { Link } from '@solidjs/router'
import { Show } from 'solid-js'
import { css, styled, useTheme } from 'solid-styled-components'

import { HeaderTabs } from './tabs'
import { User } from './user'

import LogoDark from '~icons/aivy/logo-dark'
import LogoLight from '~icons/aivy/logo-light'

const Container = styled.header`
  display: grid;
  min-height: 60px;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  grid-template-columns: 100px 150px;
  grid-template-rows: 60px;

  ${(p) => p.theme?.$().media.breakpoints.md} {
    padding: 0 4rem;
    grid-template-columns: 100px 300px;
  }
`

export const Header = () => {
  const theme = useTheme()

  return (
    <>
      <Container>
        <Link
          href="/"
          class={css`
            color: ${theme.$().colors.text.string()};

            svg {
              max-width: 100%;
              height: 40px;
              vertical-align: top;
            }
          `}
        >
          <Show when={theme.$().name === 'dark'} fallback={<LogoLight height={40} />}>
            <LogoDark height={40} />
          </Show>
        </Link>
        <User />
      </Container>
      <HeaderTabs />
    </>
  )
}
