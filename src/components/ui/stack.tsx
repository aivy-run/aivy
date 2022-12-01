import type { ComponentProps } from 'solid-js'
import { styled } from 'solid-styled-components'

type Props = ComponentProps<'div'> & {
  gap?: string | number
}

export const HStack = styled.div<Props>`
  display: flex;
  align-items: center;
  gap: ${(p) => p.gap || '0.5rem'};
`

export const VStack = styled(HStack)`
  flex-direction: column;
`
