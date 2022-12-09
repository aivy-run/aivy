import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import { createSlider } from 'solid-slider'
import { css, styled, useTheme } from 'solid-styled-components'

import { useImagePost } from '.'
import { Fallback } from '../ui/fallback'

import { useBrowserSetting } from '~/hooks/use-browser-setting'
import { createImageURL } from '~/lib/api/cloudflare'
import { classnames } from '~/lib/classnames'

const Zoom = styled.div<{ show: boolean }>`
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  background-color: rgba(0, 0, 0, 0.5);
  opacity: ${(p) => (p.show ? '1' : '0')};
  pointer-events: ${(p) => (p.show ? 'auto' : 'none')};
  transition: 0.15s ease-out;

  img {
    cursor: zoom-out;
    object-fit: contain;
    transform: scale(${(p) => (p.show ? '1' : '0.8')});
    transition: 0.15s ease-out;
  }
`

const Slider: Component<{ onLoad?: () => void; onClick?: () => void }> = (props) => {
  const [setting] = useBrowserSetting()
  const { post, index, setIndex } = useImagePost()
  const [slider, { current, moveTo }] = createSlider(
    {
      loop: false,
      initial: index(),
      slides: {
        spacing: 1,
      },
    },
    (slider) => props.onLoad && slider.on('created', props.onLoad),
  )
  createEffect(() => setIndex(current()))
  createEffect(() => {
    if (current() !== index()) moveTo(index())
  })
  return (
    <div
      use:slider={slider}
      class={classnames(
        'keen-slider',
        css`
          width: 100%;
          height: 100%;
        `,
      )}
    >
      <For each={post.information}>
        {(v, i) => (
          <div
            class={css`
              width: 100%;
              height: 100%;

              img {
                display: inline-block;
                width: 100%;
                height: 100%;
                cursor: zoom-in;
                object-fit: contain;
              }
            `}
          >
            <Show when={current() <= i() + 1 && i() - 1 <= current()}>
              <img
                src={createImageURL(
                  `post.image.${post.id}.${v.index}`,
                  `w=${setting.max_resolution.width},h=${setting.max_resolution.height}`,
                )}
                alt=""
                onClick={() => props.onClick?.()}
              />
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}

export const View: Component = () => {
  const theme = useTheme()
  const [loading, setLoading] = createSignal(true)
  const [zoom, setZoom] = createSignal(false)

  return (
    <div
      class={css`
        min-width: 100%;
        max-width: 100%;
        height: 70vh;
        background-color: rgba(0, 0, 0, 0.35);
        ${theme.$().media.breakpoints.lg} {
          min-width: 50%;
          max-width: 50%;
          height: 100%;
        }
      `}
    >
      <Show when={loading()}>
        <div
          class={css`
            width: 100%;
            height: 100%;
            background-color: ${theme.$().colors.bg.string()};
          `}
        >
          <Fallback height="100%" />
        </div>
      </Show>
      <Slider onLoad={() => setLoading(false)} onClick={() => setZoom(true)} />
      <Zoom show={zoom()} onClick={() => setZoom(!zoom())}>
        <Slider onLoad={() => setLoading(false)} />
      </Zoom>
    </div>
  )
}
