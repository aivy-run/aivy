import { A } from '@solidjs/router'
import { css, styled, useTheme } from 'decorock'
import type { Component } from 'solid-js'

import { Button } from '../ui/button'
import { useToast } from '../ui/toast'

import { HStack } from '~/components/ui/stack'
import type { CompleteImagePost } from '~/lib/api/supabase/images'
import IconLink from '~icons/carbon/link'
import IconFacebook from '~icons/carbon/logo-facebook'
import IconTwitter from '~icons/carbon/logo-twitter'
import IconLine from '~icons/thirdparty/line'

const IconButton = styled(Button)`
  padding: 0.5rem;

  div {
    width: 50px;
    height: 50px;
  }
`

export const ShareBox: Component<{ post: CompleteImagePost }> = (props) => {
  const theme = useTheme()
  const toast = useToast()

  return (
    <div>
      <div>
        <div>共有する</div>
      </div>
      <HStack>
        <A
          href={`https://twitter.com/intent/tweet?url=https://aivy.run/images/${
            props.post.id
          }&text=${encodeURIComponent(
            `${props.post.title} | ${props.post.profiles.username}`,
          )}&hashtags=aivy`}
          target="_blank"
        >
          <IconButton>
            <IconTwitter height={50} width={50} />
          </IconButton>
        </A>
        <A
          href={`https://www.facebook.com/share.php?u=${encodeURIComponent(
            `https://aivy.run/images/${props.post.id}`,
          )}`}
        >
          <IconButton>
            <IconFacebook height={50} width={50} />
          </IconButton>
        </A>
        <A
          href={`http://line.me/R/msg/text/?${encodeURIComponent(
            `${props.post.title} | ${props.post.profiles.username} https://aivy.run/images/${props.post.id}`,
          )}`}
        >
          <IconButton>
            <IconLine height={50} width={50} />
          </IconButton>
        </A>
      </HStack>
      <div
        class={css`
          display: inline-flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 0.25rem;
          background-color: ${theme.colors.text.fade(0.95)};
          gap: 1rem;
        `}
      >
        <div
          class={css`
            color: ${theme.colors.text};
          `}
        >
          https://aivy.run/images/{props.post.id}
        </div>
        <IconLink
          class={css`
            cursor: pointer;

            &:hover {
              path {
                fill: ${theme.colors.text.fade(0.5)};
              }
            }
          `}
          onClick={() => {
            navigator.clipboard.writeText(`https://aivy.run/images/${props.post.id}`)
            toast({
              title: 'クリップボードにコピーしました。',
              description: '作品のリンクをクリップボードにコピーしました。',
              status: 'success',
              isClosable: true,
            })
          }}
        />
      </div>
    </div>
  )
}
