import { createSignal } from 'solid-js'

export const [tagStore, setTagStore] = createSignal<string[]>([])
