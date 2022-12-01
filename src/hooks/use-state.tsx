import type { Location } from '@solidjs/router'
import { useLocation } from 'solid-start'

import type { State } from '~/types/state'

export const useState = (location?: Location): (() => Partial<State>) => {
  const l = location || useLocation()
  return () => ({
    ...(l.state || {}),
  })
}
