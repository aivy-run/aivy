import {
  createMemo,
  Show,
  Component,
  ComponentProps,
  createEffect,
  createSignal,
  splitProps,
} from 'solid-js'
import { useLocation, useNavigate, useSearchParams } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { PostsWithSorter } from '~/components/gallery/posts-sorter'
import { FixedTitle } from '~/components/head/title'
import { Input } from '~/components/ui/input'

// import IconAudioControl from '~icons/carbon/audio-console'
// import IconSearch from '~icons/carbon/search'

const InputContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
`

const SearchInput: Component<ComponentProps<'div'>> = (props) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [search] = useSearchParams<{ q: string }>()

  const [current, setCurrent] = createSignal(location.pathname === '/search' ? search.q : '')
  const [, others] = splitProps(props, [])

  let ref: HTMLInputElement

  createEffect(() => {
    if (!search.q) ref.focus()
    if (location.pathname === '/search') setCurrent(search.q)
  })

  return (
    <InputContainer {...others}>
      <Input
        ref={ref!}
        value={current()}
        onInput={(e) => setCurrent(e.currentTarget.value)}
        placeholder="検索"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            navigate(`/search?q=${e.currentTarget.value}`)
          }
        }}
      />
    </InputContainer>
  )
}

const Container = styled.div`
  padding: 2rem 0;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};

  ${(p) => p.theme?.$().media.breakpoints.lg} {
    padding: 2rem 12rem;
  }
`

const PostContainer = styled.div`
  padding: 1rem;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    padding: 1rem 12rem;
  }
`

export default function Search() {
  const theme = useTheme()
  const [search] = useSearchParams<{ q: string }>()
  const title = createMemo(() => (search.q ? `「${search.q}」 の検索結果` : '検索'))

  return (
    <>
      <>
        <FixedTitle>{title()} | Aivy</FixedTitle>
      </>
      <div
        class={css`
          min-height: ${theme.$().alias.main_height};
          background-color: ${theme.$().colors.bg_accent.string()};
        `}
      >
        <Container>
          <SearchInput />
        </Container>
        <Show when={search.q}>
          <PostContainer>
            <PostsWithSorter
              heading={`「${search.q}」 の検索結果`}
              index="latest"
              options={[
                {
                  title: '最新',
                  type: 'latest',
                  all: 20,
                  filter: {
                    latest: true,
                    search: search.q,
                  },
                },
                {
                  title: '人気',
                  type: 'likes',
                  all: 20,
                  filter: {
                    search: search.q,
                    build(builder) {
                      builder.order('likes', { ascending: false })
                    },
                  },
                },
              ]}
            />
          </PostContainer>
        </Show>
      </div>
    </>
  )
}
