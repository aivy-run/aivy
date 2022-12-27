import dayjs from 'dayjs'
import { css, styled } from 'decorock'
import { Component, createEffect, createMemo, createSignal, Show } from 'solid-js'
import { useSearchParams } from 'solid-start'

import { NoteList } from '.'
import { Fallback } from '../ui/fallback'
import { Pagination } from '../ui/pagination'

import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { CompleteNotePost, NotesFilter } from '~/lib/api/supabase/notes'

type PostsData = {
  count: number
  page: number
  posts: CompleteNotePost[]
}

type PropsT = {
  all: number
  filter?: Partial<NotesFilter>
  editable?: boolean
  pagination?: boolean
  url?: string
  title?: string
  fetchPosts?: ((filter?: Partial<NotesFilter>) => Promise<PostsData>) | undefined
}

type Cache = {
  expires: number
  data: {
    posts: CompleteNotePost[]
    count: number
    page: number
  }
}

const getPostsData = async (filter?: Partial<NotesFilter>) => {
  const count = await api.note.count(filter)
  const posts = await api.note.list(filter)
  return { posts, count }
}

const cache: Record<string, Cache | undefined> = {}

const Container = styled.div`
  width: 100%;
`

const Heading = styled.h1`
  margin: 0.5rem 0;
  font-size: 1.3rem;
`

export const Notes: Component<PropsT> = (props) => {
  const {
    status: { isFetching },
    accessor: [, profile],
  } = useUser(true)
  const [search] = useSearchParams<{ page: string }>()
  const page = createMemo(() => parseInt(search.page || '') || 1)
  const [loading, setLoading] = createSignal(false)

  const fetchData = createMemo(() => ({
    all: props.all,
    page: page(),
    filter: props.filter,
    profile: profile(),
    fetchPosts: props.fetchPosts,
  }))
  const fetcher = async ({
    all,
    page,
    filter,
    profile,
    fetchPosts,
  }: ReturnType<typeof fetchData>) => {
    filter = { ...filter, limit: all, since: all * (page - 1) }
    setLoading(true)
    const cacheKey = `${all}.${page}.${JSON.stringify(filter)}.${filter?.build?.toString().length}`
    const cached = cache[cacheKey]
    if (cached && !fetchPosts) {
      const now = dayjs().toDate().getTime()
      if (cached.expires > now) {
        setLoading(false)
        return cached.data
      } else delete cache[cacheKey]
    }
    const fn = fetchPosts || getPostsData
    if (profile) {
      const muted = await api.mute.list(profile.uid)
      if (muted) filter!._mute = muted.map((v) => v.target)
    }

    const postData = await fn(filter)
    const data = {
      ...postData,
      page,
    }
    cache[cacheKey] = {
      data,
      expires: dayjs().toDate().getTime() + dayjs.duration({ minutes: 3 }).asMilliseconds(),
    }
    setLoading(false)
    return data
  }
  const [data, setData] = createSignal<Awaited<ReturnType<typeof fetcher>>>()

  createEffect(() => {
    if (isFetching()) return
    fetcher(fetchData()).then(setData)
  })

  return (
    <Container>
      <Show when={data()} fallback={<Fallback height="100%" />} keyed>
        {(postData) => (
          <>
            <Show when={props.title}>
              <div
                class={css`
                  padding: 0 2rem;
                  text-align: left;
                `}
              >
                <Heading>{props.title}</Heading>
              </div>
              <br />
            </Show>
            <NoteList notes={postData.posts} editable={!!props.editable} />
            <br />
            <Show when={typeof props.pagination === 'undefined' ? true : props.pagination}>
              <Pagination
                current={postData.page}
                count={Math.ceil(postData.count / props.all)}
                url={props.url || '/'}
              />
            </Show>
          </>
        )}
      </Show>
    </Container>
  )
}
