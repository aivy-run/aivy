import type { Component, ComponentProps } from 'solid-js'
import { styled } from 'solid-styled-components'

const Container = styled.div`
  padding: 0;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    padding: 1rem 10rem;
  }
`

const Inner = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${(p) => p.theme?.$().colors.text.fade(0.5).string()};
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  text-align: center;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    border-radius: 1rem;
    border-bottom: none;
    margin-bottom: 1rem;
  }
`

export const PostContainer: Component<ComponentProps<typeof Inner>> = (props) => {
  return (
    <Container>
      <Inner {...props} />
    </Container>
  )
}
