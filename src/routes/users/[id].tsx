import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Show,
} from 'solid-js'
import { A, Meta, Outlet, useLocation, useParams } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { NotFoundError } from '~/components/error-handler'
import { FixedTitle } from '~/components/head/title'
import { Button } from '~/components/ui/button'
import { IconImg } from '~/components/ui/icon-img'
import { Tab, Tabs } from '~/components/ui/tab'
import { FetchingTransition } from '~/components/with-user'
import { useUser } from '~/context/user'
import { useState } from '~/hooks/use-state'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { UserProfile } from '~/lib/api/supabase/user'
import IconTwitter from '~icons/thirdparty/twitter'

const Container = styled.div`
  position: relative;
  display: flex;
  min-height: ${(p) => p.theme?.$().alias.main_height};
  flex-direction: column;
  align-items: center;
  border-top: solid 1.5px ${(p) => p.theme?.$().colors.text.string()};
  margin-bottom: 2rem;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    border-top: none;
  }
`

const UserBox = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 1rem 2rem;
  border-top: solid 1.5px ${(p) => p.theme?.$().colors.text.fade(0.5).string()};
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    width: 80%;
    border-radius: 0.5rem;
    border-top: none;
    margin-top: -10rem;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.25);
  }
`

export const UserContext = createContext(
  {} as { user: UserProfile['Row']; isMyPage: Accessor<boolean | undefined> },
)

export default function User() {
  const {
    util: { withUser },
  } = useUser(true)
  const theme = useTheme()
  const state = useState()
  const location = useLocation()
  const params = useParams()
  const [isMyPage, setIsMyPage] = createSignal<boolean>()
  const [isFollowing, setIsFollowing] = createSignal<boolean>()
  const [offset, setOffset] = createSignal(0)

  const id = createMemo(() => (params['id'] as string).toLowerCase())
  const [resource] = createResource(id, async (id: string) => {
    const user = state().user || (await api.user.getByID(id))
    if (!user) throw new NotFoundError()
    return user
  })

  const title = createMemo(() => `${resource()?.username} | Aivy`)

  createEffect(() => {
    const user = resource()
    withUser(async ([me]) => {
      if (!user) return
      setIsMyPage(user.uid === me.id)
      setOffset(0)
      const follows = await api.relationship.isFollowing(user.uid, me.id)
      setIsFollowing(follows)
    })
  })

  return (
    <Show
      when={resource()}
      fallback={
        <div
          class={css`
            min-height: ${theme.$().alias.main_height};
          `}
        />
      }
      keyed
    >
      {(user) => (
        <>
          <>
            <FixedTitle>{title()}</FixedTitle>
            <Meta property="og:title" content={title()} />
            <Meta property="og:description" content={user.introduction || ''} />
            <Meta
              property="og:image"
              content={createImageURL(`user.ogp.${user.uid}`, 'ogp') || ''}
            />
            <Meta name="twitter:card" content="summary_large_image" />
            <Meta name="note:card" content="summary_large_image" />
          </>
          <UserContext.Provider value={{ user, isMyPage }}>
            <Container>
              <div
                class={css`
                  position: relative;
                  z-index: -1;
                  width: 100%;

                  img {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 3/1;
                    object-fit: cover;
                    opacity: 0;
                    transition: 0.2s;
                    vertical-align: top;
                    ${theme.$().media.breakpoints.lg} {
                      aspect-ratio: 4/1;
                    }
                  }
                `}
              >
                <img
                  src={createImageURL(`user.header.${user.uid}`, 'header')}
                  alt=""
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0'
                  }}
                />
              </div>
              <UserBox>
                <div
                  class={css`
                    display: flex;
                    width: 100%;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;

                    ${theme.$().media.breakpoints.lg} {
                      flex-direction: row;
                      align-items: flex-start;
                    }

                    & > div {
                      width: 100%;
                    }
                  `}
                >
                  <div>
                    <div
                      class={css`
                        display: grid;
                        align-items: center;
                        grid-template-columns: 150px 1fr;

                        img {
                          grid-row: 1/3;
                        }

                        svg {
                          width: 25px;
                          height: 25px;
                        }
                      `}
                    >
                      <IconImg userId={user.uid} width={120} height={120} alt="" />
                      <div>
                        <h2>{user.username}</h2>
                        <div>@{user.id}</div>
                      </div>
                      <Show when={user.twitter}>
                        <A href={`https://twitter.com/${user.twitter}`} target="_blank">
                          <IconTwitter width={100} height={100} />
                        </A>
                      </Show>
                    </div>
                    <br />
                    <div
                      class={css`
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        border-radius: 0.5rem;
                        background-color: ${theme.$().colors.text.fade(0.9).string()};
                      `}
                    >
                      {user.introduction}
                    </div>
                  </div>
                  <div
                    class={css`
                      text-align: center;
                      ${theme.$().media.breakpoints.lg} {
                        min-width: 300px;
                        text-align: right;
                      }
                    `}
                  >
                    <FetchingTransition>
                      <Show
                        when={isMyPage()}
                        fallback={
                          <Button
                            class={css`
                              pointer-events: ${!isMyPage() ? 'all' : 'none'};
                            `}
                            onClick={async () => {
                              withUser(
                                async ([me], isFollowing) => {
                                  if (isFollowing) {
                                    await api.relationship.removeRelationship(user.uid, me.id)
                                    setOffset((prev) => prev - 1)
                                    setIsFollowing(false)
                                  } else {
                                    await api.relationship.addRelationship(user.uid, me.id)
                                    setOffset((prev) => prev + 1)
                                    setIsFollowing(true)
                                  }
                                },
                                null,
                                isFollowing,
                              )
                            }}
                          >
                            <Show when={isFollowing()} fallback={'フォローする'}>
                              フォロー中
                            </Show>
                          </Button>
                        }
                      >
                        <A href="/settings/profile">
                          <Button>プロフィールを編集</Button>
                        </A>
                      </Show>
                    </FetchingTransition>
                  </div>
                </div>
                <br />
                <Tabs>
                  <Tab selected={location.pathname === `/users/${user.id}`}>
                    <A href="./" state={{ user: user }} noScroll>
                      画像
                    </A>
                  </Tab>
                  <Tab selected={location.pathname === `/users/${user.id}/note`}>
                    <A href="./note" state={{ user: user }} noScroll>
                      ノート
                    </A>
                  </Tab>
                  <Tab selected={location.pathname === `/users/${user.id}/followers`}>
                    <A href="./followers" state={{ user: user }} noScroll>
                      フォロワー ({user.followers + offset()})
                    </A>
                  </Tab>
                  <Tab selected={location.pathname === `/users/${user.id}/follows`}>
                    <A href="./follows" state={{ user: user }} noScroll>
                      フォロー ({user.follows || 0})
                    </A>
                  </Tab>
                  <Tab selected={location.pathname === `/users/${user.id}/likes`}>
                    <A href="./likes" state={{ user: user }} noScroll>
                      いいね
                    </A>
                  </Tab>
                  <Tab selected={location.pathname === `/users/${user.id}/others`}>
                    <A href="./others" state={{ user: user }} noScroll>
                      その他
                    </A>
                  </Tab>
                </Tabs>
                <br />
                <Outlet />
              </UserBox>
            </Container>
          </UserContext.Provider>
        </>
      )}
    </Show>
  )
}
