import { For, Show } from 'solid-js'
import { A } from 'solid-start'
import { styled } from 'solid-styled-components'

import { Tag } from './ui/tag'

import { tagStore } from '~/lib/store'

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0.5rem 1rem;
  gap: 1rem;
  -ms-overflow-style: none;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const Tags = () => {
  return (
    <Show when={tagStore()} keyed>
      {(tags) => (
        <Container>
          <For each={tags}>
            {(tag) => (
              <A href={'/search?q=' + encodeURIComponent(`(tag:${tag})`)}>
                <Tag>{tag}</Tag>
              </A>
            )}
          </For>
        </Container>
      )}
    </Show>
  )
}
