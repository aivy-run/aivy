import { A } from '@solidjs/router'
import { css, useTheme } from 'decorock'
import { Component, JSX, Show } from 'solid-js'

import { useImagePost } from '.'
import { FetchingTransition } from '../with-user'

import { Button } from '~/components/ui/button'
import { useUser } from '~/context/user'

export const ZoningFilter: Component<{ children: JSX.Element }> = (props) => {
  const { post } = useImagePost()

  const {
    accessor: [, profile],
    status: { isGuest, isFetching },
  } = useUser(true)

  const theme = useTheme()

  return (
    <FetchingTransition ignore={post.zoning === 'normal'}>
      <Show
        when={post.zoning === 'normal' || (!isGuest() && profile()?.zoning.includes(post.zoning))}
        fallback={
          <div
            class={css`
              display: flex;
              overflow: hidden;
              width: 100%;
              min-height: 600px;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-radius: 0;
              background-color: ${theme.colors.bg_accent};
              gap: 2rem;
              opacity: ${isFetching() ? '0' : '1'};
              transition: 0.2s;
              ${theme.media.breakpoints.lg} {
                height: 70vh;
                border-radius: 0.5rem;
                margin-top: 3rem;
                box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.25);
              }

              h1 {
                font-size: 1.5rem;
              }

              span {
                display: block;
              }
            `}
          >
            <h1>R-18作品は表示できません</h1>
            <Show
              when={!isGuest()}
              fallback={
                <span>
                  <p>
                    <span>表示するにはアカウント登録が必要です。</span>
                    <span>18歳未満のユーザーには表示できません。</span>
                  </p>
                  <A href="/sign">
                    <Button>ログイン / アカウント登録</Button>
                  </A>
                </span>
              }
            >
              <p>
                <span>表示するには設定を有効にする必要があります。</span>
                <A href="/settings/account">
                  <Button>アカウント設定</Button>
                </A>
              </p>
            </Show>
          </div>
        }
      >
        {props.children}
      </Show>
    </FetchingTransition>
  )
}
