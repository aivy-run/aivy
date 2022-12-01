import { Show } from 'solid-js'
import { A } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import LogoDark from '~icons/aivy/logo-dark'
import LogoLight from '~icons/aivy/logo-light'

const Container = styled.footer`
  height: 350px;
  padding-top: 2rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  text-align: center;

  a {
    color: ${(p) => p.theme?.$().colors.text.string()};
    text-underline-offset: 3px;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const Footer = () => {
  const theme = useTheme()
  return (
    <Container>
      <div
        class={css`
          display: grid;
          align-items: center;
          grid-template-columns: 1fr 1fr;
          justify-items: center;

          h1 {
            font-size: 1.2rem;
          }

          & > div {
            text-align: left;

            div {
              margin-bottom: 0.5rem;
            }
          }
        `}
      >
        <div>
          <h1>Legal</h1>
          <br />
          <A href="/terms">
            <div>利用規約</div>
          </A>
          <A href="/terms/privacy">
            <div>プライバシーポリシー</div>
          </A>
          <A href="/terms/guideline">
            <div>ガイドライン</div>
          </A>
          <A href="/about_us">
            <div>運営情報</div>
          </A>
        </div>
        <div>
          <h1>Links</h1>
          <br />
          <A href="https://twitter.com/aivy_run" target="_blank">
            <div>Twitter</div>
          </A>
          <A href="/support">
            <div>ご意見・ご要望</div>
          </A>
        </div>
      </div>
      <div
        class={css`
          margin: 3rem 0;
        `}
      >
        <A href="/">
          <Show
            when={theme.$().name === 'dark'}
            fallback={
              <LogoLight
                class={css`
                  width: 128px;
                  height: auto;
                `}
              />
            }
          >
            <LogoDark
              class={css`
                width: 128px;
                height: auto;
              `}
            />
          </Show>
        </A>
      </div>
    </Container>
  )
}
