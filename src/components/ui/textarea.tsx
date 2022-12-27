import auto from 'autosize'
import { css, useTheme } from 'decorock'
import { Component, ComponentProps, createEffect, onMount, splitProps } from 'solid-js'

import { classnames } from '~/lib/classnames'

export const TextArea: Component<ComponentProps<'textarea'>> = (props) => {
  const theme = useTheme()
  const [local, others] = splitProps(props, ['class'])

  createEffect(() => {
    auto(props.ref as HTMLTextAreaElement)
  })

  onMount(() => setTimeout(() => auto.update(props.ref as HTMLTextAreaElement)))

  return (
    <textarea
      {...others}
      ref={props.ref!}
      class={classnames(
        local.class,
        css`
          padding: 0.5rem;
          border: solid 0.25px ${theme.colors.main.fade(0.5)};
          border-radius: 0.25rem;
          background-color: rgba(0, 0, 0, 0.05);
          color: ${theme.colors.text};
          font-size: 0.9rem;
          line-height: 1.5;
          outline: 0;

          &:focus {
            border: 1px solid ${theme.colors.main.darken(0.25)};
          }
        `,
      )}
    />
  )
}
