import { styled } from 'decorock'
import type { Component, ComponentProps } from 'solid-js'

const Container = styled.div`
  display: flex;
  justify-content: center;
`
const Inner = styled.div`
  width: 100%;
  padding: 1rem 2rem;
  border-top: solid 1px ${(p) => p.theme.colors.text.fade(0.5)};
  border-bottom: solid 1px ${(p) => p.theme.colors.text.fade(0.5)};
  background-color: ${(p) => p.theme.colors.bg_accent};

  & > {
    div {
      padding: 0 1rem;
      margin-bottom: 2rem;
    }

    h1 {
      border-bottom: solid 1px ${(p) => p.theme.colors.text.fade(0.5)};
      margin-bottom: 2rem;
      text-align: center;
    }

    h2 {
      margin-bottom: 0.5rem;
    }
  }

  a {
    color: ${(p) => p.theme.colors.main.darken(0.5)};
    text-underline-offset: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }

  ol {
    padding-left: 1.5em;

    & > li {
      list-style: decimal;

      &::marker {
        color: #444;
        font-weight: 600;
        letter-spacing: -0.05em;
      }
    }
  }

  ${(p) => p.theme.media.breakpoints.lg} {
    width: 60%;
    border-radius: 1rem;
    border-top: none;
    border-bottom: none;
    margin: 4rem 0;
  }
`

export const InformationContainer: Component<ComponentProps<'div'>> = (props) => (
  <Container>
    <Inner {...props} />
  </Container>
)
