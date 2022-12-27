import { css, useTheme } from 'decorock'
import { createEffect, createSignal } from 'solid-js'
import { A } from 'solid-start'

import { Button } from '~/components/ui/button'
import { CheckBox } from '~/components/ui/checkbox'
import { Line } from '~/components/ui/line'
import { HStack } from '~/components/ui/stack'
import { useToast } from '~/components/ui/toast'
import { useUser } from '~/context/user'
import type { UserProfile } from '~/lib/api/supabase/user'

export default function Account() {
  const {
    util: { withUser },
    setter: [updateProfile],
  } = useUser()
  const theme = useTheme()
  const toast = useToast()
  const [loading, setLoading] = createSignal(false)
  const [r18, setR18] = createSignal(false)
  const [r18g, setR18g] = createSignal(false)

  createEffect(() => {
    withUser(([, profile]) => {
      setR18(profile.zoning.includes('r18'))
      setR18g(profile.zoning.includes('r18g'))
    })
  })

  return (
    <>
      <div
        class={css`
          padding: 1rem;
        `}
      >
        <h2>表示するコンテンツ</h2>
        <HStack gap="2rem">
          <CheckBox checked={r18()} onChange={(e) => setR18(e.currentTarget.checked)}>
            R-18
          </CheckBox>
          <CheckBox checked={r18g()} onChange={(e) => setR18g(e.currentTarget.checked)}>
            R-18G
          </CheckBox>
        </HStack>
        <br />
        <div
          class={css`
            text-align: center;
          `}
        >
          <Button
            disabled={loading()}
            onClick={async () => {
              setLoading(true)
              const zoning: UserProfile['Row']['zoning'] = ['normal']
              if (r18()) zoning.push('r18')
              if (r18g()) zoning.push('r18g')
              await updateProfile({
                zoning,
              })
              setLoading(false)
              toast({
                title: '設定を更新しました。',
                status: 'success',
                isClosable: true,
              })
            }}
          >
            更新する
          </Button>
        </div>
        <br />
        <Line />
        <br />
        <h2>アカウントの削除</h2>
        <A
          class={css`
            color: ${theme.colors.text};
            text-underline-offset: 0.25rem;

            &:hover {
              text-decoration: underline;
            }
          `}
          href="/delete_account"
        >
          アカウントを削除する→
        </A>
      </div>
    </>
  )
}
