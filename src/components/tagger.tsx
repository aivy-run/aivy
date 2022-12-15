import { Component, ComponentProps, createSignal, For, Show } from 'solid-js'
import { css } from 'solid-styled-components'

import { AutoComplete } from './ui/auto-complete'
import { Tag } from './ui/tag'

export const Tagger: Component<{
  value: string[]
  max?: number
  onAdd: (value: string) => void
  onRemove: (value: string) => void
  error?: string
  suggestions?: ComponentProps<typeof AutoComplete>['suggestions']
  placeholder?: string
  confirmKey?: string[]
}> = (props) => {
  const [currentTag, setCurrentTag] = createSignal('')

  return (
    <>
      <div
        class={css`
          display: flex;
          width: 100%;
          min-height: 50px;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
        `}
      >
        <For each={props.value}>
          {(tag) => (
            <Tag
              class={css`
                user-select: none;
              `}
              removable={true}
              onRemove={() => props.onRemove(tag)}
            >
              {tag}
            </Tag>
          )}
        </For>
      </div>
      <Show when={props.max}>
        <div
          class={css`
            width: 100%;
            font-weight: bold;
            text-align: right;
          `}
        >
          {props.value.length}/{props.max}
        </div>
      </Show>
      <AutoComplete
        class={css`
          width: 100%;
        `}
        value={currentTag()}
        onInput={(v) => setCurrentTag(v)}
        placeholder={props.placeholder || ''}
        error={props.error || undefined}
        confirmKey={props.confirmKey || []}
        suggestions={props.suggestions || []}
        onChange={(value) => {
          setCurrentTag('')
          props.onAdd(value)
        }}
      />
    </>
  )
}
