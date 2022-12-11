import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { A, useNavigate } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { BookmarkButton, FavButton } from '../ui/fav-button'
import { IconImg } from '../ui/icon-img'
import { ZoningTag } from '../ui/zoning-tag'

import { useUser } from '~/context/user'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { Bookmark } from '~/lib/api/supabase/bookmarks'
import type { CompleteImagePost } from '~/lib/api/supabase/images'
import type { Like } from '~/lib/api/supabase/like'
import IconImage from '~icons/carbon/image'

const WIDTH = 220
const GAP = 14
const PADDING = 14

const Inner = styled.div<{ scroll: boolean }>`
  position: relative;
  display: inline-flex;
  max-width: 100%;
  flex-wrap: ${(p) => (p.scroll ? 'nowrap' : 'wrap')};
  align-items: center;
  justify-content: flex-start;
  padding: 0 5px;
  gap: 5px;
  overflow-x: ${(p) => (p.scroll ? 'auto' : 'hidden')};
  ${(p) => p.theme?.$().media.breakpoints.sm} {
    justify-content: ${(p) => (p.scroll ? 'flex-start' : 'center')};
    padding: ${PADDING.toString()}px;
    gap: ${GAP.toString()}px;
  }
`

const ImageBox = styled.div`
  display: grid;
  overflow: hidden;
  width: calc(50% - 5px);
  min-width: calc(50% - 5px);
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  grid-template-columns: 100%;
  grid-template-rows: 1fr 0.25fr;
  ${(p) => p.theme?.$().media.breakpoints.sm} {
    width: ${WIDTH.toString()}px;
    min-width: ${WIDTH.toString()}px;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.25);
    grid-template-rows: ${WIDTH.toString()}px 0.25fr;
  }
`

const RankingTag = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  aspect-ratio: 1/1;
  color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  font-weight: bold;
`

export const Gallery: Component<{
  posts: CompleteImagePost[]
  page: number
  all: number
  scroll?: boolean
  ranking?: boolean
}> = (props) => {
  const theme = useTheme()
  const {
    util: { withUser },
  } = useUser(true)
  const navigate = useNavigate()
  const [likes, setLikes] = createSignal<Like['Row'][]>([])
  const [bookmarks, setBookmarks] = createSignal<Bookmark['Row'][]>([])
  const [remainder, setRemainder] = createSignal<any[]>([null, null, null, null, null, null])

  let ref: HTMLDivElement

  const calcRemainder = () => {
    const count = Math.floor((ref.clientWidth - PADDING * 2) / (WIDTH + GAP))
    const result: any[] = []
    if (count < 1) return
    result.length = count
    setRemainder(result)
  }

  onMount(() => {
    calcRemainder()
    if (typeof window !== 'undefined') window.addEventListener('resize', calcRemainder)
  })
  onCleanup(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', calcRemainder)
  })

  createEffect(() => {
    if (props.posts.length < 1) setLikes([])
    else
      withUser(([me]) => {
        api.like
          .list({
            type: 'image_post',
            targets: props.posts.map((v) => v.id),
            author: me.id,
          })
          .then(setLikes)
        api.bookmark
          .list({
            targets: props.posts.map((v) => v.id),
            author: me.id,
          })
          .then(setBookmarks)
      })
  })

  return (
    <Inner ref={ref!} scroll={!!props.scroll}>
      <For each={props.posts}>
        {(post, i) => {
          const [liked, setLiked] = createSignal<boolean>()
          const [likeOffset, setLikeOffset] = createSignal(0)
          const [bookmarked, setBookmarked] = createSignal<boolean>()
          const [bookmarkOffset, setBookmarkOffset] = createSignal(0)

          const rank = createMemo(() => props.all * (props.page - 1) + i() + 1)

          createEffect(() => {
            setLiked(!!likes().find((v) => v.target === post.id))
            setBookmarked(!!bookmarks().find((v) => v.target === post.id))
          })

          return (
            <ImageBox>
              <A
                href={`/images/${post.id}`}
                class={css`
                  position: relative;
                  display: flex;
                  overflow: hidden;
                  justify-content: center;
                  border-radius: 1rem;
                  background-color: rgba(0, 0, 0, 0.75);
                  ${theme.$().media.breakpoints.sm} {
                    border-radius: 0;
                  }
                `}
                state={{
                  post: {
                    ...post,
                    likes: post.likes + likeOffset(),
                    bookmarks: post.bookmarks + bookmarkOffset(),
                  },
                }}
              >
                <img
                  src={createImageURL(`post.image.${post.id}.0`, 'thumbnail')}
                  alt=""
                  class={css`
                    width: 100%;
                    height: auto;
                    aspect-ratio: 1/1;
                    object-fit: contain;
                    transition: 0.2s;
                  `}
                />
                <Show when={post.zoning !== 'normal'}>
                  <ZoningTag>{post.zoning === 'r18' ? 'R-18' : 'R-18G'}</ZoningTag>
                </Show>
                <Show when={props.ranking}>
                  <RankingTag
                    class={css`
                      background-color: ${rank() === 1
                        ? '#d6ba49'
                        : rank() === 2
                        ? '#858585'
                        : rank() === 3
                        ? '#c8a17e'
                        : '#33333350'};
                      color: ${theme.$().colors.text.string()};
                    `}
                  >
                    {rank()}
                  </RankingTag>
                </Show>
                <Show when={post.images > 1}>
                  <div
                    class={css`
                      position: absolute;
                      right: 0.25rem;
                      bottom: 0.25rem;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      padding: 0.25rem 0.5rem;
                      border-radius: 0.25rem;
                      background-color: ${theme.$().colors.bg.fade(0.25).string()};
                      color: ${theme.$().colors.text.string()};
                      font-size: 0.9rem;
                      gap: 0.25rem;
                    `}
                  >
                    <IconImage />
                    <div>{post.images}</div>
                  </div>
                </Show>
              </A>
              <div
                class={css`
                  display: grid;
                  width: 100%;
                  align-items: center;
                  padding: 0.5rem;
                  gap: 0.5rem;
                  grid-template-columns: 80% 1fr;
                  text-align: left;

                  h1 {
                    overflow: hidden;
                    width: 100%;
                    margin-bottom: 0.5rem;
                    color: ${theme.$().colors.text.string()};
                    font-size: 1rem;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                  ${theme.$().media.breakpoints.lg} {
                    padding: 0.5rem 1rem;
                  }
                `}
              >
                <div>
                  <A
                    href={`/images/${post.id}`}
                    state={{
                      post: {
                        ...post,
                        likes: post.likes + likeOffset(),
                        bookmarks: post.bookmarks + bookmarkOffset(),
                      },
                    }}
                  >
                    <h1>{post.title}</h1>
                  </A>
                  <A href={`/users/${post.profiles.id}`} state={{ user: post.profiles }}>
                    <div
                      class={css`
                        display: flex;
                        align-items: center;
                        color: ${theme.$().colors.text.string()};
                        font-size: 0.9rem;
                        gap: 0.1rem;

                        img {
                          width: 30px;
                          height: 30px;
                          border: solid 0.25px black;
                          border-radius: 50%;
                          object-fit: cover;
                        }

                        ${theme.$().media.breakpoints.lg} {
                          font-size: 1rem;
                          gap: 0.5rem;
                        }
                      `}
                    >
                      <IconImg userId={post.profiles.uid} alt="" />
                      <h5>{post.profiles.username}</h5>
                    </div>
                  </A>
                </div>
                <div
                  class={css`
                    text-align: right;
                  `}
                >
                  <FavButton
                    selected={!!liked()}
                    class={css`
                      opacity: ${typeof liked() === 'boolean' ? '1' : '0'};
                    `}
                    onClick={async () => {
                      withUser(
                        async ([me], liked) => {
                          if (liked) {
                            await api.like.remove(post.id, 'image_post', me.id)
                            setLikeOffset((prev) => prev - 1)
                            setLiked(false)
                          } else {
                            await api.like.create(post.id, 'image_post')
                            setLikeOffset((prev) => prev + 1)
                            setLiked(true)
                          }
                        },
                        () => navigate('/sign'),
                        liked,
                      )
                    }}
                  />
                  <BookmarkButton
                    selected={!!bookmarked()}
                    class={css`
                      opacity: ${typeof bookmarked() === 'boolean' ? '1' : '0'};
                    `}
                    onClick={async () => {
                      withUser(
                        async ([me], bookmarked) => {
                          if (bookmarked) {
                            await api.bookmark.remove(post.id, me.id)
                            setBookmarkOffset((prev) => prev - 1)
                            setBookmarked(false)
                          } else {
                            await api.bookmark.create(post.id)
                            setBookmarkOffset((prev) => prev + 1)
                            setBookmarked(true)
                          }
                        },
                        () => navigate('/sign'),
                        bookmarked,
                      )
                    }}
                  />
                </div>
              </div>
            </ImageBox>
          )
        }}
      </For>
      <For each={remainder()}>
        {() => (
          <div
            class={css`
              width: ${WIDTH.toString()}px;
            `}
          />
        )}
      </For>
    </Inner>
  )
}
