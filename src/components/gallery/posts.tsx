import dayjs from 'dayjs'
import { Component, createEffect, createMemo, createSignal, JSX, Show } from 'solid-js'
import { css, styled } from 'solid-styled-components'

import { Gallery } from '.'
import { Tags } from '../tags'
import { Fallback } from '../ui/fallback'
import { Pagination } from '../ui/pagination'
import { HStack } from '../ui/stack'
import { ZoningSelector } from '../zoning-selector'
import { getPostsData } from './util'

import { useUser } from '~/context/user'
import { useURLSearchParams } from '~/hooks/use-search-params'
import { api } from '~/lib/api/supabase'
import type { ImagesFilter, ImagePost, CompleteImagePost } from '~/lib/api/supabase/images'
import type { Zoning } from '~/lib/api/supabase/user'
import { setTagStore } from '~/lib/store'
import IconRotate from '~icons/carbon/rotate-360'

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
  random?: boolean
  bypassMute?: boolean

  zoning?: ImagePost['Row']['zoning'][]

  title?: string
  zoningButton?: boolean
  tags?: boolean
  reload?: boolean
  scroll?: boolean
  ranking?: boolean
  url?: ((page: number) => string) | string
  pagination?: boolean
  fallback?: JSX.Element
}

const Container = styled.div`
  width: 100%;
`

const Heading = styled.h1`
  margin: 0.5rem 0;
  font-size: 1.3rem;
`

type Cache = {
  expires: number
  data: {
    posts: CompleteImagePost[]
    count: number
  }
}

const cache: Record<string, Cache | undefined> = {}

export const Posts: Component<Props> = (props) => {
  const {
    status: { isFetching },
    util: { withUser },
  } = useUser(true)

  const search = useURLSearchParams('page')
  const page = createMemo(() => parseInt(search().page || '') || 1)
  const [zoning, setZoning] = createSignal<Zoning[]>(['normal'])
  const [loading, setLoading] = createSignal(true)

  const fetcher = async ({
    all,
    page,
    zoning,
    random,
    filter,
    fetchPosts,
  }: {
    all: number
    page: number
    zoning: Zoning[]
    random: boolean
    filter: Props['filter']
    fetchPosts: Props['fetchPosts']
  }) => {
    setLoading(true)
    const cacheKey = `${all}.${page}.${zoning}.${random}.${JSON.stringify(filter)}.${
      filter?.build?.toString().length
    }.${fetchPosts?.toString()}`
    const cached = cache[cacheKey]
    if (cached) {
      const now = dayjs().toDate().getTime()
      if (cached.expires > now) return cached.data
      else delete cache[cacheKey]
    }
    const fn = fetchPosts || getPostsData
    const f = { ...filter }
    await withUser(
      async ([, profile]) => {
        const muted = await api.mute.list(profile.uid)
        if (muted) f!._mute = muted.map((v) => v.target)
        f!._zoning = profile.zoning
      },
      () => (f!._zoning = ['normal']),
    )
    if (props.zoningButton) f.zoning = zoning

    const postData = await fn(all, page, random, f)
    setLoading(false)
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
  const fetchData = createMemo(() => ({
    all: props.all,
    page: page(),
    zoning: zoning(),
    random: !!props.random,
    filter: props.filter,
    fetchPosts: props.fetchPosts,
  }))
  const [data, setData] = createSignal<PostsData>()

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
      <Show when={data()} fallback={props.fallback || <Fallback height="50vh" />} keyed>
        {(data) => (
          <>
            <Show when={props.title}>
              <HStack
                gap="1.5rem"
                class={css`
                  padding: 0 2rem;
                `}
              >
                <Heading>{props.title}</Heading>
                <Show when={props.reload}>
                  <IconRotate
                    class={css`
                      cursor: pointer;

                      &:hover {
                        path {
                          fill: rgba(0, 0, 0, 0.5);
                          transition: 0.2s;
                        }
                      }
                    `}
                    onClick={() => {
                      if (!loading()) fetcher(fetchData()).then(setData)
                    }}
                  />
                </Show>
              </HStack>
              <br />
            </Show>
            <Gallery
              page={data.page}
              all={props.all}
              posts={data!.posts}
              scroll={!!props.scroll}
              ranking={!!props.ranking}
            />
            <br />
            <Show when={typeof props.pagination === 'undefined' ? true : props.pagination}>
              <Pagination
                current={data.page}
                count={Math.ceil(data.count / props.all)}
                url={props.url || '/'}
              />
            </Show>
          </>
        )}
      </Show>
    </Container>
  )
}
