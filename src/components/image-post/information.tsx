import { createMemo, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { useNavigate } from 'solid-start'
import { css, useTheme } from 'solid-styled-components'

import { useImagePost } from '.'
import { TokenizedPrompt } from '../prompt'

export const Information: Component = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { post, index } = useImagePost()

  const info = createMemo(
    () => post.information.concat().sort((a, b) => (a.index > b.index ? 1 : -1))[index()],
  )

  return (
    <div
      class={css`
        margin-top: 1.5rem;

        & > div {
          color: ${theme.$().colors.text.fade(0.25).string()};
          user-select: none;

          h2 {
            margin-bottom: 1rem;
          }

          & > div {
            display: inline-block;
            color: ${theme.$().colors.text.string()};
            font-weight: bold;
            user-select: text;
          }
        }
      `}
    >
      <h2>画像情報</h2>
      <Show when={info()?.prompt} keyed>
        {(prompt) => (
          <div>
            Prompt:{' '}
            <div>
              <TokenizedPrompt
                onTokenClick={(p) => navigate(`/search?q=${encodeURIComponent(`(prompt: ${p})`)}`)}
                prompt={prompt}
              />
            </div>
          </div>
        )}
      </Show>
      <br />
      <Show when={info()?.negative_prompt} keyed>
        {(negative_prompt) => (
          <div>
            Negative Prompt:{' '}
            <div>
              <TokenizedPrompt
                onTokenClick={(p) =>
                  navigate(`/search?q=${encodeURIComponent(`(negative_prompt: ${p})`)}`)
                }
                prompt={negative_prompt}
              />
            </div>
          </div>
        )}
      </Show>
      <br />
      <Show when={info()?.model} keyed>
        {(model) => (
          <div>
            Model: <div>{model}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.steps} keyed>
        {(steps) => (
          <div>
            Steps: <div>{steps}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.cfg_scale} keyed>
        {(cfg_scale) => (
          <div>
            CFG Scale: <div>{cfg_scale}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.sampler} keyed>
        {(sampler) => (
          <div>
            Sampler: <div>{sampler}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.seed} keyed>
        {(seed) => (
          <div>
            Seed: <div>{seed}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.vae} keyed>
        {(vae) => (
          <div>
            VAE: <div>{vae}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.embedding} keyed>
        {(embedding) => (
          <div>
            Embedding: <div>{embedding}</div>
          </div>
        )}
      </Show>
      <Show when={info()?.hypernetwork} keyed>
        {(hypernetwork) => (
          <div>
            HyperNetwork: <div>{hypernetwork}</div>
          </div>
        )}
      </Show>
    </div>
  )
}
