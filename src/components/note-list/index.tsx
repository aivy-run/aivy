import { css, styled, useTheme } from 'decorock'
import { Component, createSignal, For, onCleanup, onMount } from 'solid-js'
import { A } from 'solid-start'

import { IconImg } from '../ui/icon-img'

import { createImageURL } from '~/lib/api/cloudflare'
import type { CompleteNotePost } from '~/lib/api/supabase/notes'

type PropsT = {
  notes: CompleteNotePost[]
  editable?: boolean
}

const WIDTH = 440
const GAP = 14
const PADDING = 14

const Inner = styled.div<{ scroll: boolean }>`
  position: relative;
  display: inline-flex;
  width: 100%;
  flex-wrap: ${(p) => (p.scroll ? 'nowrap' : 'wrap')};
  align-items: center;
  justify-content: flex-start;
  padding: 0 5px;
  gap: 5px;
  overflow-x: ${(p) => (p.scroll ? 'auto' : 'hidden')};
  ${(p) => p.theme.media.breakpoints.sm} {
    justify-content: ${(p) => (p.scroll ? 'flex-start' : 'center')};
    padding: ${PADDING.toString()}px;
    gap: ${GAP.toString()}px;
  }

  & > a {
    width: 100%;
  }
`

const NoteItem = styled.div`
  display: inline-flex;
  overflow: hidden;
  width: 100%;
  flex-direction: column;
  background-color: ${(p) => p.theme.colors.bg_accent};
  color: ${(p) => p.theme.colors.text};
  grid-template-columns: 100%;
  grid-template-rows: 1fr 0.25fr;
  ${(p) => p.theme.media.breakpoints.sm} {
    width: ${WIDTH.toString()}px;
    min-width: ${WIDTH.toString()}px;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.25);
    grid-template-rows: ${WIDTH.toString()}px 0.25fr;
  }

  & > div:first-child {
    width: 100%;
    aspect-ratio: 1.905/1;

    img {
      width: 100%;
    }
  }
`

export const NoteList: Component<PropsT> = (props) => {
  const theme = useTheme()
  const [remainder, setRemainder] = createSignal<any[]>(Array(3).fill(null))

  let ref: HTMLDivElement

  const calcRemainder = () => {
    const count = Math.floor((ref.clientWidth - PADDING * 2) / (WIDTH + GAP))
    const result: any[] = []
    if (count < 1) return
    result.length = count
    setRemainder(result.fill(null))
  }

  onMount(() => {
    calcRemainder()
    if (typeof window !== 'undefined') window.addEventListener('resize', calcRemainder)
  })
  onCleanup(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', calcRemainder)
  })

  return (
    <Inner ref={ref!} scroll={false}>
      <For each={props.notes}>
        {(post) => (
          <NoteItem>
            <A href={props.editable ? `/dashboard/notes/${post.id}/edit` : `/notes/${post.id}`}>
              <div>
                <img src={createImageURL(`post.note.thumbnail.${post.id}`, 'ogp')} alt="" />
              </div>
              <div>
                <div
                  class={css`
                    display: grid;
                    width: 100%;
                    align-items: center;
                    padding: 0.5rem;
                    gap: 0.5rem;
                    grid-template-columns: 80% 1fr;
                    text-align: left;

                    h1 {
                      overflow: hidden;
                      width: 100%;
                      margin-bottom: 0.5rem;
                      color: ${theme.colors.text};
                      font-size: 1.25rem;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    }
                    ${theme.media.breakpoints.lg} {
                      padding: 0.5rem 1rem;
                    }
                  `}
                >
                  <div>
                    <A
                      href={
                        props.editable ? `/dashboard/notes/${post.id}/edit` : `/notes/${post.id}`
                      }
                    >
                      <h1>{post.title}</h1>
                    </A>
                    <A href={`/users/${post.profiles.id}`} state={{ user: post.profiles }}>
                      <div
                        class={css`
                          display: inline-flex;
                          align-items: center;
                          color: ${theme.colors.text};
                          font-size: 0.9rem;
                          gap: 0.1rem;

                          img {
                            width: 30px;
                            height: 30px;
                            border: solid 0.25px black;
                            border-radius: 50%;
                            object-fit: cover;
                          }

                          ${theme.media.breakpoints.lg} {
                            font-size: 1rem;
                            gap: 0.5rem;
                          }
                        `}
                      >
                        <IconImg userId={post.profiles.uid} alt="" />
                        <h5>{post.profiles.username}</h5>
                      </div>
                    </A>
                  </div>
                </div>
              </div>
            </A>
          </NoteItem>
        )}
      </For>
      <For each={remainder()}>
        {() => (
          <div
            class={css`
              width: ${WIDTH.toString()}px;
            `}
          />
        )}
      </For>
    </Inner>
  )
}
