import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createSignal,
  For,
  Setter,
  useContext,
} from 'solid-js'
import { A } from 'solid-start'
import { css, styled } from 'solid-styled-components'

import { Comments } from '../comments'
import { ProseMirror } from '../prose-mirror'
import { HStack } from '../ui/stack'
import { Tag } from '../ui/tag'
import { ReactionButton } from './reaction-button'

import { useUser } from '~/context/user'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteNotePost } from '~/lib/api/supabase/notes'
import IconBookmark from '~icons/carbon/bookmark-filled'
import IconFavorite from '~icons/carbon/favorite-filled'

const Context = createContext(
  {} as {
    post: CompleteNotePost

    liked: Accessor<boolean | undefined>
    setLiked: Setter<boolean>
    likeOffset: Accessor<number>
    setLikeOffset: Setter<number>

    bookmarked: Accessor<boolean | undefined>
    setBookmarked: Setter<boolean>
    bookmarkOffset: Accessor<number>
    setBookmarkOffset: Setter<number>
  },
)
export const useNotePost = () => useContext(Context)

const Container = styled(ProseMirror)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;

  & > div {
    width: 100%;
    ${(p) => p.theme?.$().media.breakpoints.md} {
      width: 70%;
    }
    ${(p) => p.theme?.$().media.breakpoints.lg} {
      width: 40%;
    }
  }

  .ProseMirror {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  }
`

const User = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme?.$().colors.text.string()};
  gap: 0.5rem;

  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  h1 {
    font-size: 1.25rem;
  }

  div {
    font-size: 0.8rem;
  }
`

const Header = styled.div`
  margin-top: 1rem;

  & > h1 {
    margin-bottom: 0.5rem;
    ${(p) => p.theme?.$().media.breakpoints.lg} {
      font-size: 3rem;
    }
  }

  & > h2 {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  & > div:first-child {
    text-align: center;
  }
`

export const NotePostView: Component<{
  post: CompleteNotePost
}> = (props) => {
  const {
    util: { withUser },
  } = useUser(true)

  const [liked, setLiked] = createSignal<boolean>()
  const [likeOffset, setLikeOffset] = createSignal(0)
  const [bookmarked, setBookmarked] = createSignal<boolean>()
  const [bookmarkOffset, setBookmarkOffset] = createSignal(0)

  createEffect(() => {
    withUser(([me]) => {
      api.like.isLiked(props.post.id, 'note_post', me.id).then(setLiked)
      api.bookmark.isBookmarked(props.post.id, 'note_post', me.id).then(setBookmarked)
    })
  })

  return (
    <Context.Provider
      value={{
        post: props.post,
        liked,
        setLiked,
        likeOffset,
        setLikeOffset,

        bookmarked,
        setBookmarked,
        bookmarkOffset,
        setBookmarkOffset,
      }}
    >
      <Container>
        <Header>
          <div>
            <img src={createImageURL(`post.note.thumbnail.${props.post.id}`, 'ogp')} alt="" />
          </div>
          <br />
          <A href={`/users/${props.post.profiles.id}`}>
            <User>
              <img src={createImageURL(`user.icon.${props.post.profiles.uid}`, 'icon')} alt="" />
              <div>
                <h1>{props.post.profiles.username}</h1>
                <div>{props.post.profiles.id}</div>
              </div>
            </User>
          </A>
          <h1>{props.post.title}</h1>
          <h2>タグ</h2>
          <div>
            <For each={props.post.tags}>
              {(tag) => (
                <A href={'/search?q=' + encodeURIComponent(`(tag:${tag})`)}>
                  <Tag>{tag}</Tag>
                </A>
              )}
            </For>
          </div>
          <br />
          <h2>プロンプト</h2>
          <div>
            <For each={props.post.prompts}>
              {(prompt) => (
                <A href={'/search?q=' + encodeURIComponent(`(prompt:${prompt})`)}>
                  <Tag>{prompt}</Tag>
                </A>
              )}
            </For>
          </div>
        </Header>
        <br />
        <ReactionButton type="note_post" />

        <HStack
          class={css`
            padding: 0.25rem;
          `}
        >
          <IconFavorite />
          <p>{props.post.likes + likeOffset()}</p>
          <br />
          <IconBookmark />
          <p>{props.post.bookmarks + bookmarkOffset()}</p>
        </HStack>
        <br />
        <div
          class="ProseMirror"
          // eslint-disable-next-line solid/no-innerhtml
          innerHTML={props.post.body}
        />
        <br />
        <Comments id={props.post.id} commentable_type="note_post" />
      </Container>
    </Context.Provider>
  )
}
