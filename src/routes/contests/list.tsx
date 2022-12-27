import { styled } from 'decorock'
import { createResource, For, Show } from 'solid-js'
import { A } from 'solid-start'

import { supabase } from '~/lib/api/supabase/client'

const Container = styled.div`
  min-height: ${(p) => p.theme.alias.main_height};
  padding: 2rem 1rem;
  background-color: ${(p) => p.theme.colors.bg_accent};

  ${(p) => p.theme.media.breakpoints.lg} {
    padding: 2rem 12rem;
  }
`

const Contest = styled.div`
  padding: 1rem;
  border: 1px solid ${(p) => p.theme.colors.text};
  border-radius: 1rem;
  color: ${(p) => p.theme.colors.text};
  transition: 0.2s;

  &:hover {
    border: 1px solid ${(p) => p.theme.colors.text.fade(0.5)};
  }
`

export default function Contests() {
  const [resource] = createResource(async () => {
    const { data, error } = await supabase.from('contests').select('*')
    if (error) throw error
    return data
  })
  return (
    <Container>
      <Show when={resource()} keyed>
        {(contests) => (
          <For each={contests}>
            {(contest) => (
              <A href={`/contests/${contest.id}`}>
                <Contest>
                  <h1>{contest.title}</h1>
                  <p>{contest.description}</p>
                </Contest>
              </A>
            )}
          </For>
        )}
      </Show>
    </Container>
  )
}
