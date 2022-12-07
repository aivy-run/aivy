import { Component, ComponentProps, createSignal, splitProps } from 'solid-js'
import { css, styled, useTheme } from 'solid-styled-components'

import { classnames } from '~/lib/classnames'

export const Tabs: Component<ComponentProps<'div'>> = (props) => {
  const theme = useTheme()
  const [local, others] = splitProps(props, ['class', 'onScroll'])
  const [scroll, setScroll] = createSignal(0)

  return (
    <div
      class={classnames(
        local.class,
        css`
          position: relative;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          gap: 1rem;
          -ms-overflow-style: none;
          overflow-x: auto;
          scrollbar-width: none;
          text-align: left;

          &::-webkit-scrollbar {
            display: none;
          }

          &::after {
            position: absolute;
            bottom: 0;
            left: ${scroll().toString()}px;
            min-width: 100%;
            height: 1.25px;
            background: ${theme.$().colors.main.lighten(0.01).string()};
            content: '';
          }
        `,
      )}
      onScroll={(e) => {
        setScroll(e.currentTarget.scrollLeft)
        if (typeof local.onScroll === 'function') local.onScroll(e)
      }}
      {...others}
    />
  )
}
export const Tab = styled.div<{ selected?: boolean }>`
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
  padding: 0.25rem;
  margin-right: 0.25rem;
  color: ${(p) =>
    p.theme
      ?.$()
      .colors.text.fade(p.selected ? 0 : 0.5)
      .string()};
  cursor: pointer;
  font-weight: ${(p) => (p.selected ? 'bold' : 'normal')};

  * {
    color: ${(p) =>
      p.theme
        ?.$()
        .colors.text.fade(p.selected ? 0 : 0.5)
        .string()};
    font-weight: ${(p) => (p.selected ? 'bold' : 'normal')};
    white-space: nowrap;
  }

  &::before {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${(p) =>
      p.selected ? p.theme?.$().colors.main.darken(0.1).string() : 'transparent'};
    content: '';
  }
`
