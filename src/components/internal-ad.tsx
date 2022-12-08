import { Component, createEffect, createMemo, createSignal, For, on, Show } from 'solid-js'
import { createSlider } from 'solid-slider'
import { A } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { Fallback } from './ui/fallback'

import NETA_CONTEST_PNG from '~/assets/images/ad/neta-contest.png'
import OFFICIAL_DISCORD_PNG from '~/assets/images/ad/official-discord.png'
import OFFICIAL_TWITTER_PNG from '~/assets/images/ad/official-twitter.png'
import Left from '~icons/carbon/chevron-left'
import Right from '~icons/carbon/chevron-right'

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`

const Inner = styled.div`
  position: relative;
  overflow: hidden;
  width: 100vw;
  aspect-ratio: 3/1;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    width: 70%;
    border-radius: 1rem;
    margin-bottom: 1rem;
  }
`

const AD = styled.img`
  display: inline-block;
`

const SlideButton = styled.div`
  position: absolute;
  z-index: 5;
  top: 0;
  height: 100%;
  align-items: center;
  cursor: pointer;
  transition: 0.25s;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.25);
  }
`

const ADS: {
  image: string
  url: string
  target?: string
}[] = [
  {
    image: OFFICIAL_DISCORD_PNG,
    url: 'https://discord.gg/9NqyGWHHQu',
    target: '_blank',
  },
  {
    image: NETA_CONTEST_PNG,
    url: '/contests/1',
  },
  {
    image: OFFICIAL_TWITTER_PNG,
    url: 'https://twitter.com/aivy_run',
    target: '_blank',
  },
]

export const InternalAD: Component = () => {
  const theme = useTheme()
  const [index, setIndex] = createSignal(0)
  const [task, setTask] = createSignal(0)
  const [loading, setLoading] = createSignal(true)
  const [slider, { current, next, prev }] = createSlider({
    loop: false,
    slides: {
      number: ADS.length,
    },
    created: () => setLoading(false),
  })
  const hasPrev = createMemo(() => current() !== 0)
  const hasNext = createMemo(() => current() !== ADS.length - 1)

  createEffect(
    on(index, () => {
      clearInterval(task())
      setTask(
        setInterval(() => {
          setIndex(hasNext() ? index() + 1 : 0)
        }, 7500) as unknown as number,
      )
    }),
  )

  return (
    <Container>
      <Inner>
        <SlideButton
          class={css`
            left: 0;
            display: ${hasPrev() ? 'flex' : 'none'};
          `}
          onClick={prev}
        >
          <Left />
        </SlideButton>
        <Show when={loading()}>
          <div
            class={css`
              position: absolute;
              z-index: 10;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: ${theme.$().colors.bg.string()};
            `}
          >
            <Fallback height="100%" />
          </div>
        </Show>
        <div class="keen-slider" use:slider={slider}>
          <For each={ADS}>
            {(ad) => (
              <div>
                <A href={ad.url} target={ad.target || ''}>
                  <AD src={ad.image} />
                </A>
              </div>
            )}
          </For>
        </div>
        <SlideButton
          class={css`
            right: 0;
            display: ${hasNext() ? 'flex' : 'none'};
          `}
          onClick={next}
        >
          <Right />
        </SlideButton>
      </Inner>
    </Container>
  )
}
