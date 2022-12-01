import { Component, For } from 'solid-js'
import { A } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { IconImg } from './ui/icon-img'

import type { UserProfile } from '~/lib/api/supabase/user'

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 0.5rem 1rem;
  gap: 1rem;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    padding: 0.5rem 12rem;
  }
`

const User: Component<{ profile: UserProfile['Row'] }> = (props) => {
  const theme = useTheme()
  return (
    <A href={`/users/${props.profile.id}`}>
      <div
        class={css`
          display: grid;
          width: 100%;
          align-items: center;
          gap: 1rem;
          grid-template-columns: 50px 1fr;

          h1 {
            color: ${theme.$().colors.text.string()};
            font-size: 1rem;
          }
        `}
      >
        <IconImg userId={props.profile.uid} height={50} width={50} />
        <h1>{props.profile.username}</h1>
      </div>
    </A>
  )
}

export const UserList: Component<{
  users: UserProfile['Row'][]
}> = (props) => {
  return (
    <Container>
      <For each={props.users}>{(user) => <User profile={user} />}</For>
    </Container>
  )
}
