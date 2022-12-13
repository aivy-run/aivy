import dayjs from 'dayjs'
import { Component, createEffect, createMemo, createSignal, JSX, Show } from 'solid-js'
import { useSearchParams } from 'solid-start'
import { css, styled } from 'solid-styled-components'

import { Gallery } from '.'
import { Tags } from '../tags'
import { Fallback } from '../ui/fallback'
import { Pagination } from '../ui/pagination'
import { HStack } from '../ui/stack'
import { ZoningSelector } from '../zoning-selector'
import { getPostsData } from './util'

import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { ImagesFilter, ImagePost, CompleteImagePost } from '~/lib/api/supabase/images'
import type { UserProfile, Zoning } from '~/lib/api/supabase/user'
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
    page: number
  }
}

const cache: Record<string, Cache | undefined> = {}

export const Posts: Component<Props> = (props) => {
  const {
    status: { isFetching },
    accessor: [, profile],
  } = useUser(true)

  const [search] = useSearchParams<{ page: string }>()
  const page = createMemo(() => parseInt(search.page || '') || 1)
  const [zoning, setZoning] = createSignal<Zoning[]>(['normal'])
  const [loading, setLoading] = createSignal(false)

  const fetcher = async ({
    all,
    page,
    zoning,
    random,
    filter,
    profile,
    fetchPosts,
  }: {
    all: number
    page: number
    zoning: Zoning[]
    random: boolean
    filter: Props['filter']
    profile: UserProfile['Row'] | undefined
    fetchPosts: Props['fetchPosts']
  }) => {
    filter = filter || {}
    setLoading(true)
    const cacheKey = `${all}.${page}.${zoning}.${random}.${JSON.stringify(filter)}.${
      filter?.build?.toString().length
    }`
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
      filter._zoning = profile.zoning
    } else {
      filter._zoning = ['normal']
    }
    if (props.zoningButton) filter.zoning = zoning

    const postData = await fn(all, page, random, filter)
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
  const fetchData = createMemo(() => ({
    all: props.all,
    page: page(),
    zoning: zoning(),
    random: !!props.random,
    filter: { ...props.filter },
    profile: profile(),
    fetchPosts: props.fetchPosts,
  }))
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
              page={postData.page}
              all={props.all}
              posts={postData!.posts}
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
