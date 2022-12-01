import Color from 'color'
import { createSignal } from 'solid-js'
import { createServerAction$ } from 'solid-start/server'
import { css, styled, useTheme } from 'solid-styled-components'

import { FixedTitle } from '~/components/head/title'
import { Button } from '~/components/ui/button'
import { CheckBox } from '~/components/ui/checkbox'
import { WithUser } from '~/components/with-user'
import { deleteImageFn$ } from '~/lib/api/cloudflare'
import { supabase } from '~/lib/api/supabase/client'
import { deleteAccount } from '~/lib/api/supabase/delete-account'

const Container = styled(WithUser)`
  display: flex;
  height: ${(p) => p.theme?.$().alias.main_height};
  align-items: center;
  justify-content: center;
  margin-bottom: 4rem;
`
const Inner = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  border-top: 1px solid ${(p) => p.theme?.$().colors.text.fade(0.5).string()};
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};

  ul {
    padding-left: 1.5em;

    & > li {
      &::marker {
        color: #444;
        font-weight: 600;
        letter-spacing: -0.05em;
      }
    }
  }
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    width: 60%;
    height: auto;
    border-radius: 1rem;
    border-top: none;
    margin-top: 4rem;
  }
`

export default function DeleteAccount() {
  const [, Delete] = createServerAction$(async ({ ids, uid }: { ids: number[]; uid: string }) => {
    return Promise.all([
      ...ids.map((v) => deleteImageFn$(`post.image.${v}.0`)),
      deleteImageFn$(`user.icon.${uid}`),
      deleteImageFn$(`user.ogp.${uid}`),
      deleteImageFn$(`user.header.${uid}`),
    ])
  })
  const theme = useTheme()
  const [loading, setLoading] = createSignal(false)
  const [checked, setChecked] = createSignal(false)

  return (
    <>
      <FixedTitle>アカウント削除 | Aivy</FixedTitle>
      <Container redirectWhenGuest>
        {({ accessor: [me] }) => (
          <Inner>
            <h1>アカウントを削除する</h1>
            <br />
            <h2
              class={css`
                font-size: 1.25rem;
              `}
            >
              以下のデータは完全に削除されます
            </h2>
            <br />
            <div>
              一度アカウントを削除すると、以下のものが
              <span
                class={css`
                  color: ${theme.$().colors.text.mix(Color('red').lighten(0.5)).string()};
                `}
              >
                削除され、復元することはできません。
              </span>
            </div>
            <br />
            <div>
              <ul>
                <li>ユーザーの情報</li>
                <li>投稿された画像、いいね等</li>
              </ul>
            </div>
            <br />
            <CheckBox checked={checked()} onChange={(e) => setChecked(e.currentTarget.checked)}>
              上記内容について理解した
            </CheckBox>
            <br />
            <div
              class={css`
                display: flex;
                justify-content: center;
                padding: 1rem;
                border-radius: 0.5rem;
                background-color: ${theme.$().colors.bg.mix(Color('red').fade(0.9)).string()};
              `}
            >
              <Button
                class={css`
                  border: 1px solid ${Color('red').fade(0.75).string()};
                  background-color: ${theme.$().colors.bg.mix(Color('red').lighten(0.6)).string()};
                  color: ${theme.$().colors.text.string()};

                  &:hover {
                    background-color: ${theme
                      .$()
                      .colors.bg.mix(Color('red').lighten(0.8))
                      .string()};
                  }
                `}
                disabled={!checked() || loading()}
                onClick={async () => {
                  setLoading(true)
                  await deleteAccount(me().id, Delete)
                  await supabase.auth.signOut()
                  setTimeout(() => {
                    setLoading(false)
                    window.location.href = '/'
                  }, 2000)
                }}
              >
                アカウントを削除
              </Button>
            </div>
          </Inner>
        )}
      </Container>
    </>
  )
}
