import { css, styled } from 'decorock'
import type { Component } from 'solid-js'

import { RectSpinner } from './spinner'

import { classnames } from '~/lib/classnames'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`

export const Fallback: Component<{
  class?: string
  height?: string | number
}> = (props) => {
  return (
    <Container
      class={classnames(
        props.class,
        css`
          height: ${typeof props.height === 'number'
            ? `${props.height}px`
            : props.height || '100vh'};
        `,
      )}
    >
      <RectSpinner />
    </Container>
  )
}
