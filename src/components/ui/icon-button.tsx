import { styled } from 'decorock'

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  border-radius: 0.5rem;
  aspect-ratio: 1/1;
  background-color: transparent;
  color: ${(p) => p.theme.colors.text};
  cursor: pointer;
  outline: none;
  transition: 0.2s;
  user-select: none;

  &:hover {
    background-color: ${(p) => p.theme.colors.main.fade(0.75)};
  }
`
