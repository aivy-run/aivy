import { Component, ComponentProps, onMount, splitProps } from 'solid-js'
import { NoHydration } from 'solid-js/web'

import { classnames } from '~/lib/classnames'

export const SLOTMAP = {
  AIVY_PAGE_IMAGE: 6772430553,
} as const

export const ADS: Component<
  ComponentProps<'ins'> & {
    adSlot: keyof typeof SLOTMAP
    format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto'
  }
> = (props) => {
  const [local, others] = splitProps(props, ['class', 'adSlot', 'format'])
  onMount(() => {
    try {
      ;(window.adsbygoogle || []).push({})
    } catch (error) {
      console.error(error)
    }
  })
  return (
    <NoHydration>
      <ins
        {...others}
        class={classnames('adsbygoogle', local.class)}
        style={{ display: 'block' }}
        data-ad-client={import.meta.env['VITE_ADSENSE_ID']}
        data-ad-slot={SLOTMAP[local.adSlot]}
        data-ad-format={local.format || 'auto'}
        data-full-width-responsive="true"
        data-adtest={import.meta.env.DEV ? 'on' : 'off'}
      />
    </NoHydration>
  )
}

declare global {
  interface Window {
    adsbygoogle: any
  }
}
