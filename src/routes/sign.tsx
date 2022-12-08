import { createEffect } from 'solid-js'
import { useNavigate } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { FixedTitle } from '~/components/head/title'
import { Button } from '~/components/ui/button'
import { VStack } from '~/components/ui/stack'
import { useUser } from '~/context/user'
import { supabase } from '~/lib/api/supabase/client'
import IconGoogle from '~icons/thirdparty/google'
import IconTwitter from '~icons/thirdparty/twitter'

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
`

const LoginButton = styled(Button)`
  div {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
`

const url = (pathname: string) =>
  (import.meta.env.DEV ? import.meta.env['VITE_DEV_ORIGIN'] || 'http://localhost:3000' : '') +
  pathname

export default function Sign() {
  const {
    status: { isGuest, isFetching },
  } = useUser(true)
  const navigate = useNavigate()
  const theme = useTheme()

  createEffect(() => {
    if (isFetching()) return
    if (!isGuest()) navigate('/', { replace: true })
  })

  return (
    <>
      <FixedTitle>ログイン | Aivy</FixedTitle>
      <Container>
        <VStack
          class={css`
            width: 80%;
            padding: 1rem 0;
            border-radius: 1rem;
            background-color: ${theme.$().colors.bg_accent.string()};
            ${theme.$().media.breakpoints.md} {
              width: 50%;
            }
          `}
        >
          <h1>Login</h1>
          <br />
          <LoginButton
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: url('_auth'),
                },
              })
            }}
          >
            <IconGoogle />
            <p>Googleでログイン</p>
          </LoginButton>
          <LoginButton
            onClick={() => {
              supabase.auth.signInWithOAuth({
                provider: 'twitter',
                options: {
                  redirectTo: url('/_auth'),
                },
              })
            }}
          >
            <IconTwitter />
            <p>Twitterでログイン</p>
          </LoginButton>
        </VStack>
      </Container>
    </>
  )
}
