import {
  Component,
  ComponentProps,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from 'solid-js'
import { css, styled } from 'solid-styled-components'

import { classnames } from '~/lib/classnames'
import IconCaretDown from '~icons/carbon/caret-down'

type Item = {
  key: string
  label: string
} & Record<string, any>

type Props = {
  value: string
  items: Item[]
  onChange?: (item: Item) => void
}

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem;
  border: ${(p) => p.theme?.$().colors.main.fade(0.5).string()} solid 2px;
  border-radius: 0.25rem;
  background-color: transparent;
  color: ${(p) => p.theme?.$().colors.text.string()};
  cursor: pointer;
  transition: 0.25s;

  &:hover {
    border: ${(p) => p.theme?.$().colors.main.string()} solid 2px;
  }
`

const Items = styled.div`
  position: absolute;
  z-index: 5;
  top: 100%;
  left: 0;
  display: flex;
  overflow: hidden;
  width: 100%;
  max-height: 200px;
  flex-direction: column;
  padding: 0.5rem 0;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  box-shadow: 0 0 16px -6px rgba(0, 0, 0, 0.6);
  overflow-y: auto;
`

const Item = styled.div`
  width: 100%;
  padding: 0.5rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  text-align: left;
  transition: 0.25s;

  &:hover {
    background-color: ${(p) => p.theme?.$().colors.bg_accent.darken(0.15).string()};
  }
`

export const Select: Component<Props & Omit<ComponentProps<'div'>, 'onChange'>> = (props) => {
  const [local, others] = splitProps(props, ['class', 'value', 'items', 'onChange'])
  const [selecting, setSelecting] = createSignal(false)
  let ref: HTMLDivElement

  const listener = (e: MouseEvent) => {
    const isThis = ref === e.target || ref.contains(e.target as Node)
    if (selecting() && !isThis) setSelecting(false)
  }
  onMount(() => {
    window.addEventListener('click', listener)
  })
  onCleanup(() => {
    window.removeEventListener('click', listener)
  })

  return (
    <Container
      {...others}
      class={classnames(
        local.class,
        css`
          display: flex;
          justify-content: space-between;
        `,
      )}
      ref={ref!}
      onClick={() => {
        setSelecting(!selecting())
      }}
    >
      <p>{local.items.find((v) => v.key === local.value)?.label}</p>
      <IconCaretDown />
      <Show when={selecting()}>
        <Items>
          <For each={local.items}>
            {(item) => (
              <Item
                onClick={() => {
                  local.onChange?.(item)
                  setSelecting(false)
                }}
              >
                {item.label}
              </Item>
            )}
          </For>
        </Items>
      </Show>
    </Container>
  )
}
