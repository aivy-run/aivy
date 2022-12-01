import { Component, ComponentProps, Show, splitProps } from 'solid-js'
import { css, styled, useTheme } from 'solid-styled-components'

import { classnames } from '~/lib/classnames'
import IconClose from '~icons/carbon/close'

const Container = styled.div`
  display: inline-flex;
  height: 30px;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  gap: 0.5rem;
  white-space: nowrap;
`

export const Tag: Component<
  ComponentProps<'div'> & {
    removable?: boolean
    onRemove?: () => void
  }
> = (props) => {
  const theme = useTheme()
  const [local, others] = splitProps(props, ['children', 'class', 'removable', 'onRemove'])
  return (
    <Container
      class={classnames(
        local.class,
        css`
          background-color: ${theme.$().colors.text.string()};
          color: ${theme.$().colors.bg_accent.string()};

          p {
            margin: 0;
          }
        `,
      )}
      {...others}
    >
      <p>{local.children}</p>
      <Show when={local.removable}>
        <div
          onClick={() => local.onRemove?.()}
          class={css`
            height: 100%;
            border-radius: 0.5rem;

            svg {
              height: 100%;
            }

            &:hover {
              background-color: rgba(0, 0, 0, 0.15);
            }
          `}
        >
          <IconClose />
        </div>
      </Show>
    </Container>
  )
}
