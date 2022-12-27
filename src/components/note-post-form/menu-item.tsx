import { styled } from 'decorock'
import type { Accessor, Component, JSX } from 'solid-js'

const Button = styled.button<{ active: boolean }>`
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.25rem;
  border: none;
  border-radius: 0.5rem;
  margin-right: 0.25rem;
  background-color: ${(p) => (p.active ? p.theme.colors.text : 'transparent')};
  color: ${(p) => (p.active ? p.theme.colors.bg : p.theme.colors.text)};
  cursor: pointer;
  transition: 0.1s;
  user-select: none;

  &:hover {
    background-color: ${(p) => (p.active ? p.theme.colors.text : p.theme.colors.text.fade(0.9))};
  }

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`

export const MenuItem: Component<{
  icon: JSX.Element | undefined
  title: string | undefined
  action: ((e: MouseEvent) => void) | undefined
  isActive: Accessor<boolean> | undefined
}> = (props) => {
  return (
    <Button
      active={props.isActive?.() || false}
      onClick={(e) => props.action?.(e)}
      title={props.title || ''}
    >
      {props.icon}
    </Button>
  )
}
