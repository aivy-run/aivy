import dayjs from 'dayjs'
import { Component, createEffect, createMemo, createSignal, JSX, Show } from 'solid-js'
import { useSearchParams } from 'solid-start'
import { css, styled } from 'solid-styled-components'

import { Gallery } from '.'
import { Tags } from '../tags'
import { Fallback } from '../ui/fallback'
import { Pagination } from '../ui/pagination'
import { ZoningSelector } from '../zoning-selector'

import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { ImagesFilter, ImagePost, CompleteImagePost } from '~/lib/api/supabase/images'
import type { Zoning } from '~/lib/api/supabase/user'
import { setTagStore } from '~/lib/store'

type PostsData = {
  count: number
  page: number
  posts: CompleteImagePost[]
}

type Props = {
  all: number
  fetchPosts?:
    | ((all: number, page: number, filter?: Partial<ImagesFilter>) => Promise<PostsData>)
    | undefined
  filter?: Partial<ImagesFilter>
  search?: boolean
  bypassMute?: boolean

  zoning?: ImagePost['Row']['zoning'][]

  title?: string
  zoningButton?: boolean
  tags?: boolean
  reload?: boolean
  editable?: boolean
  scroll?: boolean
  ranking?: boolean
  url?: ((page: number) => string) | string
  pagination?: boolean
  fallback?: JSX.Element
}

type Cache = {
  expires: number
  data: {
    posts: CompleteImagePost[]
    count: number
    page: number
  }
}

const getPostsData = async (
  all: number,
  page: number,
  search: boolean,
  filter?: Partial<ImagesFilter>,
) => {
  const count = await api.image.count(filter, search)
  const posts = await api.image.list(all, all * (page - 1), search, filter)
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

export const Posts: Component<Props> = (props) => {
  const {
    status: { isFetching },
    accessor: [, profile],
  } = useUser(true)

  const [search] = useSearchParams<{ page: string }>()
  const page = createMemo(() => parseInt(search.page || '') || 1)
  const [zoning, setZoning] = createSignal<Zoning[]>(['normal'])

  const fetchData = createMemo(() => ({
    all: props.all,
    page: page(),
    zoning: zoning(),
    search: !!props.search,
    filter: { ...props.filter },
    profile: profile(),
    fetchPosts: props.fetchPosts,
  }))
  const fetcher = async ({
    all,
    page,
    zoning,
    search,
    filter,
    profile,
    fetchPosts,
  }: ReturnType<typeof fetchData>) => {
    filter = filter || {}
    const cacheKey = `${all}.${page}.${zoning}.${search}.${JSON.stringify(filter)}.${
      filter?.build?.toString().length
    }`
    const cached = cache[cacheKey]
    if (cached && !fetchPosts) {
      const now = dayjs().toDate().getTime()
      if (cached.expires > now) {
        return cached.data
      } else delete cache[cacheKey]
    }
    const fn = fetchPosts || getPostsData
    if (profile) {
      const muted = await api.mute.list(profile.uid)
      if (muted) filter!._mute = muted.map((v) => v.target)
      filter._zoning = profile.zoning
    } else {
      filter._zoning = ['normal']
    }
    if (props.zoningButton) filter.zoning = zoning

    const postData = await fn(all, page, search, filter)
    const data = {
      ...postData,
      page,
    }
    cache[cacheKey] = {
      data,
      expires: dayjs().toDate().getTime() + dayjs.duration({ minutes: 3 }).asMilliseconds(),
    }
    return data
  }
  const [data, setData] = createSignal<Awaited<ReturnType<typeof fetcher>>>()

  createEffect(() => {
    if (isFetching()) return
    fetcher(fetchData()).then(setData)
  })

  createEffect(() => {
    const posts = data()?.posts
    if (!posts) return
    setTagStore((prev) =>
      Array.from(new Set([...posts.flatMap((v) => v.tags), ...prev])).slice(0, 20),
    )
  })

  return (
    <Container>
      <Show when={props.tags}>
        <Tags />
      </Show>
      <Show when={props.zoningButton}>
        <ZoningSelector onChange={setZoning} />
      </Show>
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
            <Gallery
              page={postData.page}
              all={props.all}
              posts={postData!.posts}
              editable={!!props.editable}
              scroll={!!props.scroll}
              ranking={!!props.ranking}
            />
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
