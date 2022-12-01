import dayjs from 'dayjs'
import { createEffect, createSignal, For, Show } from 'solid-js'
import { A, useLocation } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { getPageFromLocation } from '~/components/gallery/util'
import { Button } from '~/components/ui/button'
import { Fallback } from '~/components/ui/fallback'
import { Pagination } from '~/components/ui/pagination'
import { ZoningTag } from '~/components/ui/zoning-tag'
import { useUser } from '~/context/user'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteImagePost } from '~/lib/api/supabase/images'
import IconChat from '~icons/carbon/chat'
import IconEdit from '~icons/carbon/edit'
import IconFavorite from '~icons/carbon/favorite-filled'
import IconView from '~icons/carbon/view'

const I = 20

const List = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
`

const Post = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  @media (min-width: 640px) {
    width: calc(100% / 2 - 1rem);
  }
  @media (min-width: 1280px) {
    width: calc(100% / 3 - 1rem);
  }
  @media (min-width: 1360px) {
    width: calc(100% / 4 - 1rem);
  }
  @media (min-width: 1640px) {
    width: calc(100% / 5 - 1rem);
  }
`

export default function Images() {
  const theme = useTheme()
  const location = useLocation()
  const {
    util: { withUser },
  } = useUser()
  const [posts, setPosts] = createSignal([] as CompleteImagePost[])
  const [count, setCount] = createSignal(0)
  const [page, setPage] = createSignal(1)
  const [loading, setLoading] = createSignal(true)
  createEffect(() => {
    withUser(([me]) => {
      const page = getPageFromLocation(location)
      setPage(page)
      Promise.all([
        api.image.count({
          author: [me.id],
        }),
        api.image.list(I, I * (page - 1), false, {
          author: [me.id],
          latest: true,
        }),
      ]).then(([count, posts]) => {
        setCount(count)
        setPosts(posts)
        setLoading(false)
      })
    })
  })
  return (
    <Show when={!loading()} fallback={<Fallback />}>
      <List>
        <For each={posts()}>
          {(post) => (
            <>
              <Post>
                <div
                  class={css`
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                    height: 256px;
                    border-radius: 1rem;
                    background-color: ${theme.$().colors.text.fade(0.5).string()};
                  `}
                >
                  <img
                    class={css`
                      width: 100%;
                      height: 100%;
                      object-fit: contain;
                    `}
                    src={createImageURL(`post.image.${post.id}.0`, 'thumbnail')}
                    alt=""
                  />
                  <Show when={post.zoning !== 'normal'}>
                    <ZoningTag>{post.zoning === 'r18' ? 'R-18' : 'R-18G'}</ZoningTag>
                  </Show>
                  <div
                    class={css`
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;

                      svg {
                        path {
                          fill: ${theme.$().colors.text.string()};
                        }
                      }
                    `}
                  >
                    <A href={`/dashboard/images/${post.id}/edit`} state={{ post }}>
                      <Button
                        class={css`
                          background-color: rgba(0, 0, 0, 0.75);

                          svg path {
                            fill: ${theme.$().colors.text.string()};
                          }

                          &:hover {
                            background-color: rgba(0, 0, 0, 0.95);
                          }
                        `}
                      >
                        <IconEdit />
                      </Button>
                    </A>
                  </div>
                </div>
                <div
                  class={css`
                    width: 100%;
                    text-align: left;

                    & > {
                      h1:first-child {
                        font-size: 1.25rem;
                      }

                      div:nth-child(2) {
                        color: ${theme.$().colors.text.fade(0.5).string()};
                        font-size: 0.9rem;
                      }
                    }
                  `}
                >
                  <h1>{post.title}</h1>
                  <div>{dayjs(post.created_at).format('YYYY年MM月DD日')}</div>
                  <div
                    class={css`
                      display: grid;
                      grid-template-columns: 1fr 1fr;

                      svg {
                        height: 100%;
                      }

                      & > div {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                      }
                    `}
                  >
                    <div>
                      <IconFavorite />
                      <div>{post.likes}</div>
                    </div>
                    <div>
                      <IconView />
                      <div>0</div>
                    </div>
                    <div>
                      <IconChat />
                      <div>0</div>
                    </div>
                  </div>
                </div>
              </Post>
            </>
          )}
        </For>
      </List>
      <Pagination
        count={Math.ceil(count() / I)}
        current={page()}
        url={(v) => `/dashboard/images?page=${v}`}
      />
    </Show>
  )
}
