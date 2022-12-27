import dayjs from 'dayjs'
import { css, styled, useTheme } from 'decorock'
import { createMemo, createResource, For, Show } from 'solid-js'
import { useParams } from 'solid-start'

import { NotFoundError } from '~/components/error-handler'
import { PostsWithSorter } from '~/components/gallery/posts-sorter'
import { supabase } from '~/lib/api/supabase/client'

const Container = styled.div`
  padding: 2rem 1rem;
  background-color: ${(p) => p.theme.colors.bg_accent};

  ${(p) => p.theme.media.breakpoints.lg} {
    padding: 2rem 12rem;
  }
`

const PostContainer = styled.div`
  padding: 1rem 0;
  ${(p) => p.theme.media.breakpoints.lg} {
    padding: 1rem 12rem;
  }
`

export default function Contest() {
  const params = useParams()
  const id = createMemo(() => parseInt(params['id'] as string))
  const theme = useTheme()
  const today = createMemo(() => dayjs(dayjs().format('YYYY-MM-DD')))
  const [resource] = createResource(id, async (id) => {
    const { data, error, status } = await supabase
      .from('contests')
      .select('*')
      .eq('id', id)
      .single()
    if (status === 406) throw new NotFoundError()
    if (error) throw error
    return data
  })

  return (
    <Show when={resource()} keyed>
      {(data) => (
        <div
          class={css`
            background-color: ${theme.colors.bg_accent};
          `}
        >
          <Container>
            <h1>{data.title}</h1>
            <p>
              <For each={data.description?.split('\n')}>
                {(line, i) => (
                  <>
                    <Show when={i() !== 0}>
                      <br />
                    </Show>
                    {line}
                  </>
                )}
              </For>
            </p>
          </Container>
          <PostContainer>
            <PostsWithSorter
              index="latest"
              options={[
                {
                  title: '最新',
                  type: 'latest',
                  all: 50,
                  filter: {
                    latest: true,
                    contest_id: data.id,
                  },
                },
                {
                  title: today().format('MM月DD日') + 'のランキング',
                  type: 'likes',
                  all: 50,
                  filter: {
                    contest_id: data.id,
                    build(builder) {
                      builder.order('likes', { ascending: false })
                      builder.gte('created_at', dayjs(today()).format())
                    },
                  },
                },
                {
                  title: '総合ランキング',
                  type: 'total',
                  all: 50,
                  filter: {
                    contest_id: data.id,
                    build(builder) {
                      builder.order('likes', { ascending: false })
                    },
                  },
                },
              ]}
            />
          </PostContainer>
        </div>
      )}
    </Show>
  )
}
