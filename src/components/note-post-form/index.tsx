import type { UploadFile } from '@solid-primitives/upload'
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { StarterKit } from '@tiptap/starter-kit'
import dayjs from 'dayjs'
import { css, styled } from 'decorock'
import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createSignal,
  Match,
  on,
  Setter,
  Show,
  Switch,
} from 'solid-js'
import { createStore, SetStoreFunction } from 'solid-js/store'
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap'

import { ProseMirror } from '../prose-mirror'
import { Tab, Tabs } from '../ui/tab'
import { MenuBar } from './menu-bar'
import { Settings } from './settings'

import {
  createDirectUploadUrl,
  createImageURL,
  fetchImage,
  uploadImage,
} from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { NotePost } from '~/lib/api/supabase/notes'
import { createNoteThumbnail } from '~/lib/image/note-thumbnail'
import { blobToBase64 } from '~/lib/image/util'

export const NoteFormContext = createContext(
  {} as {
    id: number
    data: NotePost['Insert']
    setData: SetStoreFunction<NotePost['Insert']>
    post: () => Promise<void>
    thumbnail: Accessor<UploadFile | undefined>
    setThumbnail: Setter<UploadFile | undefined>
  },
)

const Container = styled.div`
  ${(p) => p.theme.media.breakpoints.lg} {
    margin: 2rem 4rem;
  }

  *::selection {
    background-color: ${(p) => p.theme.colors.text.fade(0.7)};
  }
`

const EditorContainer = styled.div`
  position: relative;
  max-height: 90vh;
  border: 3px solid ${(p) => p.theme.colors.text};
  border-radius: 0.5rem;
  overflow-y: auto;
`

const Editor = styled(ProseMirror)`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: ${(p) => p.theme.colors.bg};
  color: ${(p) => p.theme.colors.text};
`

export const NotePostForm: Component<{
  id: number
}> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement>()
  const [tab, setTab] = createSignal<'edit' | 'setting'>('edit')
  const [thumbnail, setThumbnail] = createSignal<UploadFile>()
  const [data, setData] = createStore<NotePost['Insert']>({
    title: 'No Title',
    body: '',
    tags: [],
    prompts: [],
    published: false,
  })

  const post = async () => {
    if (!data.id) return
    const result = await api.note.update(props.id, {
      ...data,
      body: html() || '',
      updated_at: dayjs().format(),
    })
    let image = thumbnail() || {
      name: 'thumbnail.png',
      size: 0,
      file: new File([], 'thumbnail.png'),
      source: createImageURL(`post.note.thumbnail.${props.id}`, 'ogp'),
    }
    const id = `post.note.thumbnail.${props.id}`
    const exists = await fetchImage(id)
    if (exists.ok) {
      if (image.size > 0) await fetchImage(id, { method: 'DELETE' })
    } else {
      const tmp = await createNoteThumbnail(result)
      image = {
        name: 'thumbnail.png',
        size: tmp.size,
        file: new File([tmp], 'thumbnail.png'),
        source: await blobToBase64(tmp),
      }
    }
    if (image.size > 0) {
      const url = await createDirectUploadUrl()
      await uploadImage(url, image.file, id)
      await fetch(createImageURL(`post.note.thumbnail.${props.id}`, 'ogp'), {
        cache: 'no-cache',
      })
    }
    image.source = createImageURL(`post.note.thumbnail.${props.id}`, 'ogp')
    setThumbnail(image)
  }

  createEffect(on(() => data.id, post))
  createEffect(() => {
    api.note.get(props.id).then(({ profiles: _, ...data }) => setData(data))
  })

  const editor = createTiptapEditor(() => ({
    element: ref()!,
    extensions: [Link, Highlight, Image, StarterKit],
    content: data.body || '',
  }))
  const html = useEditorHTML(editor)

  return (
    <NoteFormContext.Provider
      value={{ data, setData, thumbnail, setThumbnail, post, id: props.id }}
    >
      <Container
        class={css`
          opacity: ${editor() ? '1' : '0'};
          transition: 0.2s;
        `}
      >
        <Tabs>
          <Tab selected={tab() === 'edit'} onClick={() => setTab('edit')}>
            Edit
          </Tab>
          <Tab
            selected={tab() === 'setting'}
            onClick={() => {
              setData('body', html())
              setTab('setting')
            }}
          >
            Setting
          </Tab>
        </Tabs>
        <br />
        <Switch>
          <Match when={tab() === 'edit'}>
            <EditorContainer>
              <Show when={editor()} keyed>
                {(editor) => <MenuBar editor={editor} />}
              </Show>
              <Editor ref={setRef} />
            </EditorContainer>
          </Match>
          <Match when={tab() === 'setting'}>
            <Settings />
          </Match>
        </Switch>
      </Container>
    </NoteFormContext.Provider>
  )
}
