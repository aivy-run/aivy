import { styled } from 'solid-styled-components'

export const Line = styled.div`
  border: solid 0.25px ${(p) => p.theme?.$().colors.text.fade(0.75).string()};
`
