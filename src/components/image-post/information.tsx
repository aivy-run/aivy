import { css, useTheme } from 'decorock'
import { createMemo, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { useNavigate } from 'solid-start'

import { useImagePost } from '.'
import { TokenizedPrompt } from '../prompt'

export const Information: Component = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { info, index } = useImagePost()

  const information = createMemo(() => info[index()])

  return (
    <div
      class={css`
        margin-top: 1.5rem;

        & > div {
          color: ${theme.colors.text.fade(0.25)};
          user-select: none;

          h2 {
            margin-bottom: 1rem;
          }

          & > div {
            display: inline-block;
            color: ${theme.colors.text};
            font-weight: bold;
            user-select: text;
          }
        }
      `}
    >
      <h2>画像情報</h2>
      <Show when={information()?.prompt} keyed>
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
      <Show when={information()?.negative_prompt} keyed>
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
      <Show when={information()?.model} keyed>
        {(model) => (
          <div>
            Model: <div>{model}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.steps} keyed>
        {(steps) => (
          <div>
            Steps: <div>{steps}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.cfg_scale} keyed>
        {(cfg_scale) => (
          <div>
            CFG Scale: <div>{cfg_scale}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.sampler} keyed>
        {(sampler) => (
          <div>
            Sampler: <div>{sampler}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.seed} keyed>
        {(seed) => (
          <div>
            Seed: <div>{seed}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.vae} keyed>
        {(vae) => (
          <div>
            VAE: <div>{vae}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.embedding} keyed>
        {(embedding) => (
          <div>
            Embedding: <div>{embedding}</div>
          </div>
        )}
      </Show>
      <Show when={information()?.hypernetwork} keyed>
        {(hypernetwork) => (
          <div>
            HyperNetwork: <div>{hypernetwork}</div>
          </div>
        )}
      </Show>
    </div>
  )
}
