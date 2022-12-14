import Color from 'color'
import { styled } from 'decorock'

export const ZoningTag = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  background-color: ${Color('red').lighten(0.25)};
  color: white;
  font-weight: 500;
`
