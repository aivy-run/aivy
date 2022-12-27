import { css, styled } from 'decorock'
import { Component, ComponentProps, For, Show, splitProps } from 'solid-js'

import { CircleSpinner } from './spinner'

const StyledButton = styled.button`
  position: relative;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 1rem;
  margin: 0.5rem;
  background-color: ${(p) => p.theme.colors.main.fade(0.8)};
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  font-size: medium;
  font-weight: bold;
  outline: none;
  text-align: center;
  text-decoration: none;
  transition: 0.2s;

  &:hover {
    background-color: ${(p) => p.theme.colors.main.fade(0.7)};
  }

  &:active {
    div {
      color: ${(p) => p.theme.colors.text.lighten(0.7)};
    }

    background-color: ${(p) => p.theme.colors.main.darken(0.75).fade(0.75)};
  }
`

const Inner = styled.div<{ disabled: boolean }>`
  width: 100%;
  height: 100%;
  color: ${(p) => p.theme.colors.text.fade(p.disabled ? 0.5 : 0)};
`

const Status = styled.div`
  margin-top: 0.5rem;
  color: ${(p) => p.theme.colors.text.fade(0.5)};
  font-size: 0.9rem;
`

export const Button: Component<
  ComponentProps<typeof StyledButton> & {
    loading?: boolean
    status?: string | undefined
  }
> = (props) => {
  const [local, others] = splitProps(props, ['children', 'loading', 'status', 'onClick'])
  return (
    <StyledButton
      {...others}
      onClick={(e) => {
        if (local.loading) return e.preventDefault()
        if (typeof local.onClick === 'function') local.onClick(e)
      }}
    >
      <Inner
        class={css`
          display: flex;
          align-items: center;
          justify-content: center;
        `}
        disabled={!!props.disabled}
      >
        <Show when={!local.loading} fallback={<CircleSpinner />}>
          {local.children}
        </Show>
      </Inner>
      <Show when={local.loading && local.status}>
        <Status>
          <For each={props.status?.split('\n')}>
            {(line, i) => (
              <>
                <Show when={i() !== 0}>
                  <br />
                </Show>
                {line}
              </>
            )}
          </For>
        </Status>
      </Show>
    </StyledButton>
  )
}
