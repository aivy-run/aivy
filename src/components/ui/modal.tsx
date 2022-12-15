import {
  Component,
  createContext,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  Show,
  useContext,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import { css, styled } from 'solid-styled-components'

import { Button } from './button'
import { VStack } from './stack'

const ModalContainer = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  align-items: center;
  justify-content: center;
  opacity: ${(p) => (p.show ? '1' : '0')};
  pointer-events: ${(p) => (p.show ? 'auto' : 'none')};
  transform: scale(${(p) => (p.show ? '1' : '0.8')});
  transition: 0.2s ease-out;
`

const ModalBackground = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: rgba(0, 0, 0, ${(p) => (p.show ? '0.75' : '0')});
  pointer-events: none;
  transition: 0.2s ease-in-out;
`

const Modal = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  animation-duration: 0.5s;
  animation-name: fade-in;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  box-shadow: 0 0 12px -6px rgba(0, 0, 0, 0.6);
  gap: 1rem;
  grid-template-rows: 1fr 50px;

  h1 {
    font-size: 23px;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`

type ModalOption = {
  title?: string
  description?: string
  render?: (close: () => void) => JSX.Element
  style?: string
  zIndex?: number
}

const ModalContext = createContext((option: ModalOption) => {})

export const ModalProvider: Component<{ children: JSX.Element }> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false)
  const [cool, setCool] = createSignal(false)
  const [option, setOption] = createSignal({} as ModalOption)
  const [zIndex, setZIndex] = createSignal(100)

  const open = (option: ModalOption) => {
    setCool(true)
    setOption(option)
    setIsOpen(true)
    setTimeout(() => setCool(false), 50)
    setZIndex(option.zIndex || 100)
  }

  let ref: HTMLDivElement

  const listener = (e: MouseEvent) => {
    const isThis = ref === e.target || ref.contains(e.target as Node)
    if (!cool() && isOpen() && !isThis) setIsOpen(false)
  }
  onMount(() => {
    if (!isServer) window.addEventListener('click', listener)
  })
  onCleanup(() => {
    if (!isServer) window.removeEventListener('click', listener)
  })

  return (
    <ModalContext.Provider value={open}>
      {props.children}
      <ModalBackground
        show={isOpen()}
        class={css`
          z-index: ${(zIndex() - 1).toString()};
        `}
      />
      <ModalContainer
        show={isOpen()}
        class={css`
          z-index: ${zIndex().toString()};
        `}
      >
        <Modal ref={ref!} class={option().style}>
          <Show
            when={option().render}
            fallback={
              <VStack>
                <div>
                  <h1>{option().title}</h1>
                  <p>{option().description}</p>
                </div>
                <Button onClick={() => setIsOpen(false)}>閉じる</Button>
              </VStack>
            }
          >
            {option().render?.(() => setIsOpen(false))}
          </Show>
        </Modal>
      </ModalContainer>
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
