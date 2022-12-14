import dayjs from 'dayjs'
import { css, styled, useTheme } from 'decorock'
import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createSignal,
  Setter,
  useContext,
} from 'solid-js'
import { useSearchParams } from 'solid-start'

import { ADS } from '../ads'
import { Pagination } from '../ui/pagination'
import { Information } from './information'
import { MetaInfo, UserInfo } from './meta'
import { ReactionButton } from './reaction-button'
import { View } from './view'
import { ZoningFilter } from './zoning-filter'

import { Comments } from '~/components/comments'
import { HStack, VStack } from '~/components/ui/stack'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { CompleteImagePost, ImageInformation } from '~/lib/api/supabase/images'
import IconBookmark from '~icons/carbon/bookmark-filled'
import IconFavorite from '~icons/carbon/favorite-filled'
import IconView from '~icons/carbon/view'

const Container = styled.div`
  width: 100%;
  height: auto;
  padding: 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.text.fade(0.5)};
  ${(p) => p.theme.media.breakpoints.lg} {
    min-height: 100%;
    padding: 3rem;
    border-bottom: none;
  }
`

const Context = createContext(
  {} as {
    post: CompleteImagePost
    info: ImageInformation['Row'][]

    index: Accessor<number>
    setIndex: Setter<number>

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

export const useImagePost = () => useContext(Context)
export const ImagePostView: Component<{
  post: CompleteImagePost
  info: ImageInformation['Row'][]
}> = (props) => {
  const {
    util: { withUser },
  } = useUser(true)

  const [search] = useSearchParams<{ i: string }>()
  const theme = useTheme()

  const [liked, setLiked] = createSignal<boolean>()
  const [likeOffset, setLikeOffset] = createSignal(0)
  const [bookmarked, setBookmarked] = createSignal<boolean>()
  const [bookmarkOffset, setBookmarkOffset] = createSignal(0)
  const [index, setIndex] = createSignal((parseInt(search.i) || 1) - 1)

  createEffect(() => {
    withUser(([me]) => {
      api.image.increaseViews(props.post.id)
      api.like.isLiked(props.post.id, 'image_post', me.id).then(setLiked)
      api.bookmark.isBookmarked(props.post.id, 'image_post', me.id).then(setBookmarked)
    })
  })

  return (
    <Context.Provider
      value={{
        post: props.post,
        info: props.info,

        index,
        setIndex,

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
        <ZoningFilter>
          <div
            class={css`
              display: grid;
              width: 100%;
              padding: 1rem;
              border-radius: 0;
              background-color: ${theme.colors.bg_accent};
              gap: 1rem;

              & > div {
                display: flex;
                flex-direction: column;
              }
              ${theme.media.breakpoints.lg} {
                border-radius: 0.5rem;
                border-bottom: none;
                box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.25);
                grid-template-columns: 1fr 0.5fr;
              }
            `}
          >
            <MetaInfo />
            <VStack
              class={css`
                align-items: flex-start;
                gap: 0.5rem;
              `}
            >
              <UserInfo />
              <ReactionButton type="image_post" />
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
                <br />
                <IconView />
                <p>{props.post.views}</p>
              </HStack>
              <div
                class={css`
                  color: ${theme.colors.text.fade(0.25)};
                  font-size: 0.9rem;
                `}
              >
                {dayjs(props.post.created_at).format('YYYY??? MM??? DD???')}
              </div>
            </VStack>
          </div>
          <div
            class={css`
              display: none;
              ${theme.media.breakpoints.lg} {
                display: block;
                margin-top: 1rem;
              }
            `}
          >
            <Pagination
              count={props.post.images}
              current={index() + 1}
              onClick={(page) => setIndex(page - 1)}
              key="i"
              noScroll={true}
            />
          </div>
          <div
            class={css`
              display: flex;
              overflow: hidden;
              width: 100%;
              height: auto;
              flex-direction: column;
              align-items: center;
              padding: 0.5rem 0;
              border-radius: 0;
              background-color: ${theme.colors.bg_accent};
              gap: 0.5rem;
              ${theme.media.breakpoints.lg} {
                height: 70vh;
                flex-direction: row;
                padding: 0;
                border-radius: 0.5rem;
                margin-top: 1rem;
                box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.25);
                gap: 2rem;
              }
            `}
          >
            <div
              class={css`
                display: block;
                ${theme.media.breakpoints.lg} {
                  display: none;
                }
              `}
            >
              <Pagination
                count={props.post.images}
                current={index() + 1}
                onClick={(page) => setIndex(page - 1)}
                key="i"
                noScroll={true}
              />
            </div>
            <View />
            <div
              class={css`
                width: 100%;
                height: 100%;
                padding: 1rem;
                overflow-y: auto;
                ${theme.media.breakpoints.lg} {
                  width: 50%;
                  padding: 1rem 0;
                }
              `}
            >
              <Information />
            </div>
          </div>
          <Comments id={props.post.id} commentable_type="image_post" />
        </ZoningFilter>
        <div
          class={css`
            width: 100%;
            text-align: center;
          `}
        >
          <ADS adSlot="AIVY_PAGE_IMAGE" format="horizontal" />
        </div>
      </Container>
    </Context.Provider>
  )
}
