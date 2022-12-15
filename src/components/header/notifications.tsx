import { createEffect, createSignal, For, Match, on, Show, Switch } from 'solid-js'
import type { Component } from 'solid-js'
import { A } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { Button } from '../ui/button'
import { IconImg } from '../ui/icon-img'
import { Line } from '../ui/line'

import { useUser } from '~/context/user'
import { useFloating } from '~/hooks/use-floating'
import { api } from '~/lib/api/supabase'
import type { CompleteNotification } from '~/lib/api/supabase/notification'
import IconNotification from '~icons/carbon/notification'

const Container = styled.div`
  position: absolute;
  z-index: 10;
  top: 100%;
  right: 0;
  overflow: hidden;
  width: 250px;
  max-height: 330px;
  border-radius: 0.5rem;
  margin-top: 1rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
  overflow-y: auto;
`

const NoticeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  font-size: 12.5px;
  gap: 1rem;
  transition: 0.2s;

  a {
    color: ${(p) => p.theme?.$().colors.text.string()};
  }

  &:hover {
    background-color: ${(p) => p.theme?.$().colors.text.fade(0.9).string()};
  }
`

const truncate = (str: string) => {
  let len = 0
  let result = ''
  for (const v of str) {
    result += v
    if (len > 10) return result + '...'
    if (v.match(/[ -~]/)) len += 1
    else len += 2
  }
  return str
}
const I = 5

export const Notifications: Component = () => {
  const {
    accessor: [, profile],
  } = useUser()
  const theme = useTheme()
  let ref: HTMLDivElement
  const [open, setOpen] = useFloating(() => ref!)
  const [count, setCount] = createSignal(0)
  const [notifications, setNotifications] = createSignal<CompleteNotification[]>([])
  const [page, setPage] = createSignal(1)
  const [complete, setComplete] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  const read = (n: CompleteNotification[]) => api.notification.read(n.map((v) => v.id))

  createEffect(() => {
    if (open()) return
    api.notification
      .count({
        target_user: profile().uid,
        read: false,
      })
      .then(setCount)
  })

  createEffect(() => {
    if (open() && notifications().length > 0) read(notifications())
  })

  createEffect(
    on(page, (page) => {
      setLoading(true)
      api.notification
        .list({
          target_user: profile().uid,
          limit: I,
          since: I * (page - 1),
          latest: true,
        })
        .then((v) => {
          if (v.length < I) setComplete(true)
          setNotifications((prev) => [...prev, ...v])
          setLoading(false)
          if (open() && v.length > 0) read(v)
        })
    }),
  )

  return (
    <div
      class={css`
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      `}
    >
      <IconNotification
        width={25}
        height={25}
        onClick={() => {
          setOpen(true)
        }}
      />
      <Show when={count() > 0}>
        <span
          class={css`
            position: absolute;
            top: -6px;
            right: -7px;
            display: inline-block;
            min-width: 18px;
            height: 18px;
            padding: 1.5px 3px;
            border: 2px solid ${theme.$().colors.bg_accent.string()};
            border-radius: 50%;
            background-color: ${theme.$().colors.main.darken(0.25).string()};
            color: #fff;
            font-size: 10px;
            line-height: 1.1;
            user-select: none;
            white-space: nowrap;
          `}
        >
          {count()}
        </span>
      </Show>
      <Container
        ref={ref!}
        class={css`
          opacity: ${open() ? '1' : '0'};
          pointer-events: ${open() ? 'all' : 'none'};
        `}
      >
        <Show
          when={notifications().length > 0}
          fallback={
            <div
              class={css`
                padding: 0.5rem;
                font-weight: bold;
              `}
            >
              まだなにもないようです...
            </div>
          }
        >
          <For each={notifications()}>
            {(v) => {
              return (
                <>
                  <NoticeItem
                    class={css`
                      background-color: ${v.read
                        ? 'transparent'
                        : theme.$().colors.sub.fade(0.75).string()};
                    `}
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    <A href={`/users/${v.author.id}`} state={{ user: v.author }}>
                      <div
                        class={css`
                          width: 40px;
                          height: 40px;
                          padding: 0;

                          img {
                            width: 100%;
                            height: 100%;
                            user-select: none;
                          }
                        `}
                      >
                        <IconImg userId={v.author.uid} />
                      </div>
                    </A>
                    <div>
                      <Switch>
                        <Match when={v.type === 'comment_like'}>
                          <A href={`/images/${v.target_image_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんがあなたのコメントにいいね！しました。
                          </A>
                        </Match>
                        <Match when={v.type === 'image_post_like'}>
                          <A href={`/images/${v.target_image_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんが
                            <span>{truncate(v.target_image_post?.title || '')}</span>
                            にいいね！しました。
                          </A>
                        </Match>
                        <Match when={v.type === 'image_post_comment'}>
                          <A href={`/images/${v.target_image_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんが
                            <span>{truncate(v.target_image_post?.title || '')}</span>
                            にコメントしました。
                          </A>
                        </Match>
                        <Match when={v.type === 'image_post_comment_reply'}>
                          <A href={`/images/${v.target_image_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんがあなたのコメントに返信しました。
                          </A>
                        </Match>
                        <Match when={v.type === 'note_post_like'}>
                          <A href={`/notes/${v.target_note_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんが
                            <span>{truncate(v.target_note_post?.title || '')}</span>
                            にいいね！しました。
                          </A>
                        </Match>
                        <Match when={v.type === 'note_post_comment'}>
                          <A href={`/notes/${v.target_note_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんが
                            <span>{truncate(v.target_note_post?.title || '')}</span>
                            にコメントしました。
                          </A>
                        </Match>
                        <Match when={v.type === 'note_post_comment_reply'}>
                          <A href={`/notes/${v.target_note_post?.id}`}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんがあなたのコメントに返信しました。
                          </A>
                        </Match>
                        <Match when={v.type === 'relationship'}>
                          <A href={`/users/${v.author.id}`} state={{ user: v.author }}>
                            <span
                              class={css`
                                font-weight: bold;
                              `}
                            >
                              {v.author.username}
                            </span>
                            さんにフォローされました。
                          </A>
                        </Match>
                      </Switch>
                    </div>
                  </NoticeItem>
                  <Line />
                </>
              )
            }}
          </For>
        </Show>
        <Show when={!complete()}>
          <Button
            class={css`
              padding: 0.25rem;
              font-size: 0.8rem;
            `}
            loading={loading()}
            onClick={() => {
              setPage(page() + 1)
            }}
          >
            もっと読み込む
          </Button>
        </Show>
      </Container>
    </div>
  )
}
