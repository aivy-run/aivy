import { Accessor, Component, createContext, createEffect, createSignal, Setter } from 'solid-js'
import { css, styled } from 'solid-styled-components'

import { Button } from '../ui/button'
import { TextArea } from '../ui/textarea'

import type { CompleteComment } from '~/lib/api/supabase/comments'

const Form = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
`

export const CommentContext = createContext(
  {} as {
    id: number
    comments: Accessor<CompleteComment[]>
    setComments: Setter<CompleteComment[]>
  },
)

export const CommentForm: Component<{ onSubmit: (content: string) => any; focus?: boolean }> = (
  props,
) => {
  const [comment, setComment] = createSignal('')
  const [sending, setSending] = createSignal(false)
  let ref: HTMLTextAreaElement
  createEffect(() => {
    if (props.focus) ref.focus()
  })
  return (
    <Form>
      <div
        class={css`
          display: grid;
          grid-template-columns: 1fr 100px;
        `}
      >
        <TextArea
          ref={ref!}
          class={css`
            width: 100%;
            resize: none;
          `}
          placeholder="コメントを入力..."
          value={comment()}
          onInput={(e) => setComment(e.currentTarget.value)}
        />
        <Button
          loading={sending()}
          onClick={async () => {
            setSending(true)
            await props.onSubmit(comment())
            setComment('')
            setSending(false)
          }}
        >
          送信
        </Button>
      </div>
    </Form>
  )
}
