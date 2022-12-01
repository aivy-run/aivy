import {
  Component,
  ComponentProps,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  Match,
  Show,
  splitProps,
  Switch,
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
  const [pending, setPending] = createSignal(true)
  createEffect(() => setPending(isFetching()))

  const ok = createMemo(() => props.ignore || !pending())

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
  const data = useUser(true)
  const [local, others] = splitProps(props, ['children', 'fallback', 'redirectWhenGuest'])
  const navigate = useNavigate()

  createEffect(() => {
    if (!data.status.isFetching() && data.status.isGuest() && local.redirectWhenGuest)
      navigate('/sign', { replace: true })
  })

  return (
    <FetchingTransition {...others}>
      <Show when={!data.status.isGuest() && data} fallback={local.fallback} keyed>
        {(args) => (
          <Switch>
            <Match when={typeof local.children === 'function' && local.children} keyed>
              {(fn) => fn(args as ArgT)}
            </Match>
            <Match when={typeof local.children !== 'function' && local.children} keyed>
              {(children) => children}
            </Match>
          </Switch>
        )}
      </Show>
    </FetchingTransition>
  )
}
