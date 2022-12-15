import type { Component } from 'solid-js'
import { useNavigate } from 'solid-start'
import { css } from 'solid-styled-components'

import { useNotePost } from '.'
import { BookmarkButton, FavButton } from '../ui/fav-button'
import { useModal } from '../ui/modal'
import { HStack } from '../ui/stack'
import { ShareBox } from './share-box'

import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { LikeTypes } from '~/lib/api/supabase/like'
import IconShare from '~icons/carbon/share'

export const ReactionButton: Component<{
  type: LikeTypes
}> = (props) => {
  const {
    util: { withUser },
  } = useUser(true)
  const { post, liked, setLiked, bookmarked, setBookmarked, setLikeOffset, setBookmarkOffset } =
    useNotePost()
  const modal = useModal()
  const navigate = useNavigate()
  return (
    <HStack>
      <FavButton
        selected={!!liked()}
        onClick={(selected) => {
          withUser(
            async ([me]) => {
              if (selected) {
                await api.like.remove(post.id, props.type, me.id)
                setLikeOffset((prev) => prev - 1)
                setLiked(false)
              } else {
                await api.like.create(post.id, props.type)
                setLikeOffset((prev) => prev + 1)
                setLiked(true)
              }
            },
            () => navigate('/sign'),
          )
        }}
      />
      <BookmarkButton
        selected={!!bookmarked()}
        onClick={(selected) => {
          withUser(
            async ([me]) => {
              if (selected) {
                await api.bookmark.remove(post.id, props.type, me.id)
                setBookmarkOffset((prev) => prev - 1)
                setBookmarked(false)
              } else {
                await api.bookmark.create(post.id, props.type)
                setBookmarkOffset((prev) => prev + 1)
                setBookmarked(true)
              }
            },
            () => navigate('/sign'),
          )
        }}
      />
      <IconShare
        class={css`
          cursor: pointer;
        `}
        height={25}
        width={25}
        onClick={() => {
          modal({
            render: () => <ShareBox post={post} />,
            zIndex: 9,
          })
        }}
      />
    </HStack>
  )
}
