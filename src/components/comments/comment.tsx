import dayjs from 'dayjs'
import {
  Component,
  createEffect,
  createMemo,
  createReaction,
  createSignal,
  For,
  onMount,
  Show,
  useContext,
} from 'solid-js'
import { A, useNavigate } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { CommentContext } from '.'
import { CommentForm } from './form'

import { Button } from '~/components/ui/button'
import { FavButton } from '~/components/ui/fav-button'
import { IconButton } from '~/components/ui/icon-button'
import { IconImg } from '~/components/ui/icon-img'
import { useModal } from '~/components/ui/modal'
import { HStack } from '~/components/ui/stack'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { CompleteComment } from '~/lib/api/supabase/comments'
import IconCaretDown from '~icons/carbon/caret-down'
import IconCaretUp from '~icons/carbon/caret-up'
import IconChat from '~icons/carbon/chat'

const CommentItem = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
`
const UserItem = styled.aside`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  color: ${(p) => p.theme?.$().colors.text.string()};
  gap: 0.5rem;

  img {
    margin: 4px 0;
  }

  h2 {
    font-size: 0.8rem;
  }
`

const CommentContent = styled.p`
  font-size: 1rem;
`

const ReplyList = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
  gap: 0.5rem;

  &::before {
    position: absolute;
    top: 40px;
    bottom: 0;
    left: 62px;
    width: 2px;
    background-color: ${(p) => p.theme?.$().colors.text.fade(0.75).string()};
    content: '';
  }
`

export const Comment: Component<
  { comment: CompleteComment } & (
    | {
        type: 'comment'
      }
    | {
        type: 'reply'
        onReplyClick: () => void
        onDelete: () => void
      }
  )
> = (props) => {
  const {
    accessor: [, profile],
    util: { withUser },
  } = useUser(true)
  const { id, commentable_type, setComments, likes, setLikes } = useContext(CommentContext)
  const modal = useModal()
  const navigate = useNavigate()
  const theme = useTheme()

  const [open, setOpen] = createSignal(false)
  const [openReplies, setOpenReplies] = createSignal(false)
  const [replyCount, setReplyCount] = createSignal(0)
  const [replies, setReplies] = createSignal<CompleteComment[]>([])
  const [likeOffset, setLikeOffset] = createSignal(0)

  createEffect(() => {
    if (props.type !== 'comment') return
    const reps = replies()
    if (reps.length < 1) return
    api.like
      .list({
        targets: reps.map((v) => v.id),
        type: 'comment',
      })
      .then((v) => setLikes((prev) => [...prev, ...v]))
  })
  onMount(() => {
    if (props.type !== 'comment') return
    api.comment
      .count({
        parent_id: props.comment.id,
        commentable_type,
      })
      .then(setReplyCount)
  })
  const trackReplyLoad = createReaction(() => {
    if (props.type !== 'comment') return
    // eslint-disable-next-line solid/reactivity
    if (!openReplies()) trackReplyLoad(() => openReplies())
    if (openReplies()) {
      api.comment
        .list({
          parent_id: props.comment.id,
          commentable_type,
        })
        .then(setReplies)
    }
  })
  trackReplyLoad(() => openReplies())

  const createdAt = createMemo(() => dayjs(props.comment.created_at))
  const time = createMemo(() => {
    const diff = dayjs().diff(createdAt())
    if (diff > dayjs.duration({ days: 1 }).asMilliseconds())
      return createdAt().format('YYYY年 MM月 DD日 HH時mm分')
    else if (diff > dayjs.duration({ hours: 1 }).asMilliseconds())
      return `${Math.floor(diff / dayjs.duration({ hours: 1 }).asMilliseconds())}時間前`
    else return `${Math.floor(diff / dayjs.duration({ minutes: 1 }).asMilliseconds())}分前`
  })
  const liked = createMemo(() => likes().findIndex((v) => v.target === props.comment.id) !== -1)

  return (
    <>
      <CommentItem>
        <HStack
          class={css`
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          `}
        >
          <A href={`/users/${props.comment.author.id}`} state={{ user: props.comment.author }}>
            <UserItem>
              <IconImg userId={props.comment.author.uid} />
              <h2>{props.comment.author.username}</h2>
            </UserItem>
          </A>
          <div
            class={css`
              color: ${theme.$().colors.text.fade(0.25).string()};
              font-size: 0.9rem;
            `}
          >
            {time()}
          </div>
        </HStack>
        <CommentContent
          class={css`
            padding-left: ${props.type === 'comment' ? '0' : '2rem'};
          `}
        >
          {props.comment.body}
        </CommentContent>
        <br />
        <HStack
          class={css`
            align-items: center;
            justify-content: space-between;
          `}
        >
          <HStack
            class={css`
              padding-left: ${props.type === 'comment' ? '0' : '2rem'};
              gap: 0.25rem;
            `}
          >
            <Show when={props.type === 'comment'}>
              <IconButton
                class={css`
                  font-size: 1.2rem;
                `}
                onClick={() => {
                  if (props.type === 'comment') setOpen(!open())
                  else props.onReplyClick()
                }}
              >
                <IconChat />
              </IconButton>
            </Show>
            <HStack
              class={css`
                align-items: center;
                user-select: none;
              `}
            >
              <FavButton
                selected={liked()}
                onClick={() => {
                  withUser(
                    async ([me], liked) => {
                      if (liked) {
                        await api.like.remove(props.comment.id, 'comment', me.id)
                        setLikes(likes().filter((v) => v.target !== props.comment.id))
                        setLikeOffset((prev) => prev - 1)
                      } else {
                        const result = await api.like.create(props.comment.id, 'comment')
                        setLikes((prev) => [...prev, result])
                        setLikeOffset((prev) => prev + 1)
                      }
                    },
                    () => navigate('/sign'),
                    liked,
                  )
                }}
              />
              {props.comment.likes + likeOffset()}
            </HStack>
          </HStack>
          <Show when={props.comment.author.uid === profile()?.uid}>
            <div
              class={css`
                display: inline-block;
                cursor: pointer;
                text-underline-offset: 0.1rem;

                &:hover {
                  text-decoration: underline;
                }
              `}
              onClick={async () => {
                modal({
                  render: (close) => (
                    <div>
                      <h1>コメントを削除しますか？</h1>
                      <Button
                        onClick={async () => {
                          await api.comment.remove(props.comment.id)
                          if (props.type === 'comment')
                            setComments((prev) => prev.filter((v) => v.id !== props.comment.id))
                          else props.onDelete()
                          close()
                        }}
                      >
                        削除する
                      </Button>
                    </div>
                  ),
                })
              }}
            >
              削除
            </div>
          </Show>
        </HStack>
      </CommentItem>
      <Show when={props.type === 'comment'}>
        <div>
          <Show when={replyCount() > 0}>
            <div
              class={css`
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                user-select: none;

                &:hover {
                  background-color: ${theme.$().colors.text.fade(0.75).string()};
                }
              `}
              onClick={() => {
                setOpenReplies(!openReplies())
              }}
            >
              <Show when={openReplies()} fallback={<IconCaretUp />}>
                <IconCaretDown />
              </Show>
              {replyCount()}件の返信
            </div>
          </Show>
        </div>
        <Show when={openReplies() || open()}>
          <ReplyList>
            <For each={replies()}>
              {(reply) => (
                <Comment
                  comment={reply}
                  type="reply"
                  onReplyClick={() => setOpen(true)}
                  onDelete={() => setReplies((prev) => prev.filter((v) => v.id !== reply.id))}
                />
              )}
            </For>
            <div
              class={css`
                position: relative;
                border-radius: 0.5rem;
                text-align: left;
              `}
            >
              <Show
                when={open()}
                fallback={
                  <div
                    class={css`
                      display: inline-block;
                      padding: 0.5rem;
                      border: 1px solid ${theme.$().colors.text.string()};
                      border-radius: 0.5rem;
                      background-color: ${theme.$().colors.bg.string()};
                      cursor: pointer;
                      user-select: none;
                    `}
                    onClick={() => setOpen(true)}
                  >
                    返信を追加
                  </div>
                }
              >
                <CommentForm
                  focus
                  onSubmit={(content) =>
                    withUser(
                      async ([, profile], comment) => {
                        const result = await api.comment.comment(
                          id,
                          commentable_type,
                          profile.uid,
                          comment,
                          props.comment.id,
                        )
                        setReplies((prev) => [...prev, { ...result, author: profile }])
                        setReplyCount((prev) => prev + 1)
                        setOpenReplies(true)
                        setOpen(false)
                      },
                      () => navigate('/sign'),
                      () => content,
                    )
                  }
                />
              </Show>
            </div>
          </ReplyList>
        </Show>
      </Show>
    </>
  )
}
