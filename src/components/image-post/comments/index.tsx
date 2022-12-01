import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createSignal,
  For,
  Setter,
  Show,
} from 'solid-js'
import { useNavigate } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { Button } from '../../ui/button'
import { Fallback } from '../../ui/fallback'
import { Comment } from './comment'
import { CommentForm } from './form'

import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { CompleteComment } from '~/lib/api/supabase/comments'
import type { CompleteLike } from '~/lib/api/supabase/like'

const I = 10

export const CommentContext = createContext(
  {} as {
    id: number
    comments: Accessor<CompleteComment[]>
    setComments: Setter<CompleteComment[]>
    likes: Accessor<CompleteLike[]>
    setLikes: Setter<CompleteLike[]>
  },
)

const Container = styled.div`
  h1 {
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }

  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};

  ${(p) => p.theme?.$().media.breakpoints.lg} {
    padding: 1rem 12rem;
    background-color: transparent;
  }
`

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const Comments: Component<{ id: number }> = (props) => {
  const {
    util: { withUser },
  } = useUser(true)
  const theme = useTheme()
  const navigate = useNavigate()
  const [page, setPage] = createSignal(1)
  const [complete, setComplete] = createSignal(false)
  const [comments, setComments] = createSignal<CompleteComment[]>([])
  const [likes, setLikes] = createSignal<CompleteLike[]>([])
  const [firstLoad, setFirstLoad] = createSignal(true)
  const [loading, setLoading] = createSignal(true)

  const fetch = async (id: number, page: number) => {
    const comments = await api.comment.list({
      commentable_type: 'image_post',
      commentable_id: id,
      parent_id: -1,
      limit: I,
      since: I * (page - 1),
      latest: true,
    })

    if (comments.length < I) setComplete(true)
    setComments((prev) => {
      const filtered = comments.filter((v2) => prev.findIndex((v3) => v3.id === v2.id) === -1)
      return [...prev, ...filtered]
    })
    setFirstLoad(false)
    setLoading(false)
  }

  createEffect(() => {
    setLoading(true)
    fetch(props.id, page())
  })
  createEffect(() => {
    withUser(
      async ([me], comments) => {
        if (comments.length < 1) return
        const likes = await api.like.list({
          type: 'comment',
          targets: comments.map((v) => v.id),
          author: me.id,
        })
        setLikes((prev) => {
          const filtered = likes.filter((v) => prev.findIndex((v2) => v2.id === v.id) === -1)
          return [...prev, ...filtered]
        })
      },
      null,
      comments,
    )
  })

  return (
    <CommentContext.Provider
      value={{
        id: props.id,
        comments,
        setComments,
        likes,
        setLikes,
      }}
    >
      <Container>
        <CommentForm
          onSubmit={async (content) => {
            await withUser(
              async ([me, profile], comment) => {
                const result = await api.comment.comment(props.id, 'image_post', me.id, comment)
                setComments((prev) => [{ ...result, author: profile }, ...prev])
              },
              () => navigate('/sign'),
              () => content,
            )
          }}
        />
        <br />
        <Show when={!firstLoad()} fallback={<Fallback height="auto" />}>
          <CommentList>
            <For each={comments()}>{(comment) => <Comment comment={comment} type="comment" />}</For>
            <Show when={!complete()}>
              <div
                class={css`
                  padding: 1rem;
                  border-radius: 0.5rem;
                  background-color: ${theme.$().colors.bg_accent.string()};
                  text-align: center;
                `}
              >
                <Button loading={loading()} onClick={() => setPage(page() + 1)}>
                  さらに読み込む
                </Button>
              </div>
            </Show>
          </CommentList>
        </Show>
      </Container>
    </CommentContext.Provider>
  )
}
