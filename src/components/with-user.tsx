import {
  Component,
  ComponentProps,
  createEffect,
  createMemo,
  JSX,
  Show,
  splitProps,
} from 'solid-js'
import { useNavigate } from 'solid-start'
import { css } from 'solid-styled-components'

import { useUser } from '~/context/user'
import { classnames } from '~/lib/classnames'

type ArgT = ReturnType<typeof useUser<false>>

export const FetchingTransition: Component<
  ComponentProps<'div'> & {
    ignore?: boolean
    fallback?: JSX.Element
  }
> = (props) => {
  const {
    status: { isFetching },
  } = useUser(true)
  const [local, others] = splitProps(props, ['class', 'children', 'ignore', 'fallback'])

  const ok = createMemo(() => props.ignore || !isFetching())

  return (
    <div
      class={classnames(
        local.class,
        css`
          opacity: ${ok() ? '1' : '0'};
          pointer-events: ${ok() ? 'all' : 'none'};
          transition: 0.2s;
        `,
      )}
      {...others}
    >
      <Show when={ok()} fallback={local.fallback}>
        {local.children}
      </Show>
    </div>
  )
}

export const WithUser: Component<
  Omit<ComponentProps<'div'>, 'children'> & {
    redirectWhenGuest?: boolean
    children: ((args: ArgT) => JSX.Element) | JSX.Element
    fallback?: JSX.Element
  }
> = (props) => {
  const userData = useUser(true)
  const [local, others] = splitProps(props, ['children', 'fallback', 'redirectWhenGuest'])
  const data = createMemo(() => !userData.status.isGuest() && userData)
  const navigate = useNavigate()

  createEffect(() => {
    if (!userData.status.isFetching() && userData.status.isGuest() && local.redirectWhenGuest)
      navigate('/sign', { replace: true })
  })

  return (
    <FetchingTransition {...others}>
      <Show when={data()} fallback={local.fallback} keyed>
        {(args) => {
          const child = props.children
          if (typeof child === 'function') return child(args as ArgT)
          else return <>{child}</>
        }}
      </Show>
    </FetchingTransition>
  )
}
