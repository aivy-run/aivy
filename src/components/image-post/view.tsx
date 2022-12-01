import { Component, createEffect, createSignal, on, Show } from 'solid-js'
import { css, styled, useTheme } from 'solid-styled-components'

import { useImagePost } from '.'
import { Fallback } from '../ui/fallback'

import { useBrowserSetting } from '~/hooks/use-browser-setting'
import { createImageURL } from '~/lib/api/cloudflare'

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

export const View: Component = () => {
  const { post, index } = useImagePost()
  const [setting] = useBrowserSetting()
  const theme = useTheme()
  const [zoom, setZoom] = createSignal(false)
  const [loading, setLoading] = createSignal(true)

  createEffect(on(index, () => setLoading(true)))

  return (
    <>
      <div
        class={css`
          position: relative;
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.35);

          img {
            height: 420px;
            cursor: zoom-in;
            object-fit: contain;
            opacity: ${loading() ? '0' : '1'};
            ${theme.$().media.breakpoints.lg} {
              width: 100%;
              height: 100%;
            }
          }
          ${theme.$().media.breakpoints.lg} {
            width: 50%;
            height: 100%;
          }
        `}
      >
        <Show when={loading()}>
          <div
            class={css`
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            `}
          >
            <Fallback height="100%" />
          </div>
        </Show>
        <img
          src={createImageURL(
            `post.image.${post.id}.${index()}`,
            `w=${setting.max_resolution.width},h=${setting.max_resolution.height}`,
          )}
          alt=""
          onClick={() => setZoom(!zoom())}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
        />
      </div>
      <Zoom show={zoom()} onClick={() => setZoom(!zoom())}>
        <img
          src={createImageURL(
            `post.image.${post.id}.${index()}`,
            `w=${setting.max_resolution.width},h=${setting.max_resolution.height}`,
          )}
          alt=""
          class={css`
            width: auto;
            height: 100%;
            border-radius: 0.5rem;
            background-color: rgba(0, 0, 0, 0.5);
            cursor: zoom-out;
          `}
        />
      </Zoom>
    </>
  )
}
