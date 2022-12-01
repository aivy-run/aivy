import {
  Component,
  createContext,
  createEffect,
  createSignal,
  For,
  JSX,
  Match,
  Show,
  Switch,
  useContext,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { css, styled, useTheme } from 'solid-styled-components'

import IconCheck from '~icons/carbon/checkmark-outline'
import IconClose from '~icons/carbon/close'
import IconError from '~icons/carbon/error'
import IconInfo from '~icons/carbon/information'

type ToastOption = {
  status: 'success' | 'error' | 'info'
  title: string
  description?: string
  duration?: number
  isClosable?: boolean
}

const ToastContext = createContext((option: ToastOption) => {})

const ToastContainer = styled.div`
  position: fixed;
  z-index: 10;
  left: 0;
  display: flex;
  height: 100vh;
  flex-direction: column-reverse;
  padding: 1rem;
  gap: 1rem;
  pointer-events: none;
`

const Toast: Component<
  ToastOption & {
    onHide: () => void
  }
> = (props) => {
  const theme = useTheme()
  const [hide, setHide] = createSignal(false)

  const hideToast = () => {
    setHide(true)
    setTimeout(() => props.onHide(), 500)
  }

  createEffect(() => {
    setTimeout(() => hideToast(), props.duration || 5000)
  })

  return (
    <div
      class={css`
        display: grid;
        min-width: 300px;
        align-items: center;
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: ${theme.$().colors.bg_accent.string()};
        box-shadow: 0 0 16px -6px rgba(0, 0, 0, 0.6);
        gap: 0.25rem;
        grid-template-columns: 50px 1fr 25px;
        opacity: ${hide() ? '0' : '1'};
        pointer-events: all;
        transition: 0.5s;

        h1 {
          font-size: 1.25rem;
        }
      `}
    >
      <div
        class={css`
          width: 100%;
          height: 100%;

          svg {
            width: 100%;
            height: 100%;
          }
        `}
      >
        <Switch>
          <Match when={props.status === 'error'}>
            <IconError />
          </Match>
          <Match when={props.status === 'success'}>
            <IconCheck />
          </Match>
          <Match when={props.status === 'info'}>
            <IconInfo />
          </Match>
        </Switch>
      </div>
      <div>
        <h1>{props.title}</h1>
        <Show when={props.description}>
          <p>{props.description}</p>
        </Show>
      </div>
      <Show when={props.isClosable}>
        <div
          class={css`
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.25rem;

            svg {
              width: 100%;
              height: 100%;
              vertical-align: top;
            }

            &:hover {
              background-color: ${theme.$().colors.bg.string()};
            }
          `}
          onClick={() => hideToast()}
        >
          <IconClose />
        </div>
      </Show>
    </div>
  )
}

export const ToastProvider: Component<{ children: JSX.Element }> = (props) => {
  const [toasts, setToasts] = createStore<
    (ToastOption & {
      created_at: number
    })[]
  >([])

  const createToast = (option: ToastOption) => {
    const created_at = new Date().getTime()
    setToasts((prev) => [{ ...option, created_at }, ...prev])
  }

  return (
    <>
      <ToastContainer>
        <For each={toasts}>
          {(option) => (
            <Toast
              {...option}
              onHide={() =>
                setToasts((prev) => prev.filter((toast) => toast.created_at !== option.created_at))
              }
            />
          )}
        </For>
      </ToastContainer>
      <ToastContext.Provider value={createToast}>{props.children}</ToastContext.Provider>
    </>
  )
}

export const useToast = () => useContext(ToastContext)
