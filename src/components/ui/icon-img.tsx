import { css } from 'decorock'
import { Component, ComponentProps, splitProps } from 'solid-js'

import { createImageURL } from '~/lib/api/cloudflare'
import { classnames } from '~/lib/classnames'

export const IconImg: Component<
  ComponentProps<'img'> & {
    userId: string
  }
> = (props) => {
  const [local, others] = splitProps(props, ['class', 'height', 'width', 'userId'])
  return (
    <img
      class={classnames(
        local.class,
        css`
          width: ${typeof local.width === 'number' ? `${local.width}px` : local.width || '30px'};
          height: ${typeof local.height === 'number'
            ? `${local.height}px`
            : local.height || '30px'};
          border: 1px solid black;
          border-radius: 50%;
        `,
      )}
      src={createImageURL(`user.icon.${local.userId}`, `icon`)}
      width={local.width || 30}
      height={local.height || 30}
      {...others}
    />
  )
}
