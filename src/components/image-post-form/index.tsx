import type { UploadFile } from '@solid-primitives/upload'
import Color from 'color'
import { css, styled, useTheme } from 'decorock'
import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Tagger } from '../tagger'
import { Tab, Tabs } from '../ui/tab'
import { ImageInformationForm } from './image-information'

import { ImageUpload } from '~/components/image-upload'
import { Button } from '~/components/ui/button'
import { CheckBox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Required } from '~/components/ui/required'
import { HStack, VStack } from '~/components/ui/stack'
import { TextArea } from '~/components/ui/textarea'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteImagePost, ImageInformation, ImagePost } from '~/lib/api/supabase/images'
import { parseMetadata } from '~/lib/parse-png-meta'
import { loadMeta } from '~/lib/png-meta'

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0;
  ${(p) => p.theme.media.breakpoints.md} {
    padding: 2rem;
  }
`

type Props =
  | {
      onSubmit: (
        post: Omit<ImagePost['Insert'], 'author'>,
        information: ImageInformation['Insert'][],
        images: UploadFile[],
      ) => Promise<void> | void
      status?: string
    } & (
      | {
          mode: 'post'
        }
      | {
          mode: 'edit'
          initial: {
            post: CompleteImagePost
            info: ImageInformation['Row'][]
          }
          onDelete: () => void
        }
    )

const isEmpty = (v?: string) => !v || !v.match(/\S/g)

export const ImagePostUploader: Component<Props> = (props) => {
  const theme = useTheme()
  const [images, setImages] = createSignal<UploadFile[]>([])
  const [selected, setSelected] = createSignal(0)
  const [loading, setLoading] = createSignal(false)
  const [autoLoad, setAutoLoad] = createSignal(true)
  const [autoCopy, setAutoCopy] = createSignal(false)
  const [data, setData] = createStore<Omit<ImagePost['Insert'], 'author'>>({
    title: '',
    description: '',
    images: 0,
    zoning: 'normal',
    tags: [],
  })
  const [information, setInformation] = createStore<ImageInformation['Insert'][]>([])
  const [errors, setErrors] = createStore({} as Record<string, string>)

  createEffect(() => {
    if (props.mode === 'edit') {
      const {
        post: { profiles: _, ...others },
        info,
      } = props.initial
      setData(others)
      setInformation(info)
      setImages(
        info.map(
          (v) =>
            ({
              source: createImageURL(`post.image.${others.id}.${v.index}`),
            } as UploadFile),
        ),
      )
    }
  })

  return (
    <Container>
      <div
        class={css`
          width: 100%;
          min-height: 100vh;
          padding: 1rem 0;
          border-top: solid 1px black;
          background-color: ${theme.colors.bg_accent};
          text-align: center;
          ${theme.media.breakpoints.md} {
            width: 80%;
            min-height: none;
            border-radius: 0.5rem;
            border-top: none;
          }
        `}
      >
        <Show when={props.mode === 'post'}>
          <h2>???????????????????????????</h2>
        </Show>
        <ImageUpload
          multiple={true}
          editable={props.mode === 'post'}
          selectable={true}
          selected={selected()}
          onSelect={setSelected}
          images={images()}
          onChange={async (files) => {
            setErrors('image', '')
            if (files.length < 1) {
              setImages([])
              if (autoLoad()) setInformation([])
              return
            } else if (files.length > 100) {
              setErrors('image', '100????????????????????????????????????????????????')
              return
            }
            const filtered: UploadFile[] = []
            for (const [i, file] of Object.entries(files)) {
              if (file.file.size > 10485760) {
                setErrors('image', '????????????????????????10MB???????????????????????????????????????')
                continue
              }
              filtered.push(file)

              const meta = await loadMeta(file.file)
              const info = { ...(autoLoad() ? parseMetadata(meta) : {}) }
              setInformation(parseInt(i), info)
            }
            setImages(filtered)
            setData('images', filtered.length)
            return
          }}
          class={css`
            width: 100%;
          `}
        />
        <Show when={errors['image']}>
          <div
            class={css`
              color: ${Color('red').lighten(0.25)};
            `}
          >
            {errors['image']}
          </div>
        </Show>
        <br />
        <VStack
          class={css`
            align-items: flex-start;
            padding: 0 4rem;
          `}
        >
          <Show when={props.mode === 'post'}>
            <CheckBox checked={autoLoad()} onChange={(e) => setAutoLoad(e.currentTarget.checked)}>
              ????????????????????????????????????
            </CheckBox>
          </Show>
          <CheckBox checked={autoCopy()} onChange={(e) => setAutoCopy(e.currentTarget.checked)}>
            ????????????????????????????????????
          </CheckBox>
        </VStack>
        <VStack
          class={css`
            padding: 1rem 2rem;
          `}
        >
          <div
            class={css`
              width: 100%;
            `}
          >
            <Show when={!autoCopy()}>
              <Tabs>
                <For each={images()}>
                  {(_, i) => (
                    <Tab selected={i() === selected()} onClick={() => setSelected(i())}>
                      {i() + 1}??????
                    </Tab>
                  )}
                </For>
              </Tabs>
            </Show>
            <br />
            <For each={images()}>
              {(_, i) => (
                <Show when={i() === selected()}>
                  <ImageInformationForm
                    data={information[i()]!}
                    onChange={(key, value) => {
                      if (autoCopy())
                        for (const [index] of Object.entries(images()))
                          setInformation(parseInt(index), key, value)
                      else setInformation(i(), key, value)
                    }}
                  />
                </Show>
              )}
            </For>
          </div>
          <br />
          <Input
            error={errors['title']}
            required={true}
            placeholder="????????????"
            value={data.title || ''}
            onInput={(e) => setData('title', e.currentTarget.value)}
          />
          <TextArea
            class={css`
              width: 100%;
            `}
            placeholder="??????"
            value={data.description || ''}
            onInput={(e) => setData('description', e.currentTarget.value)}
          />
          <div
            class={css`
              width: 100%;
              text-align: left;
            `}
          >
            <Required />
            <div
              class={css`
                display: flex;
                width: 100%;
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
                ${theme.media.breakpoints.lg} {
                  flex-direction: row;
                  gap: 5rem;
                }
              `}
            >
              <h3>????????????</h3>
              <CheckBox
                checked={data.zoning === 'normal'}
                onClick={(e) => {
                  if (data.zoning === 'normal') e.preventDefault()
                  if (e.currentTarget.checked) setData('zoning', 'normal')
                }}
              >
                ?????????
              </CheckBox>
              <CheckBox
                checked={data.zoning === 'r18'}
                onClick={(e) => {
                  if (data.zoning === 'r18') e.preventDefault()
                  if (e.currentTarget.checked) setData('zoning', 'r18')
                }}
              >
                R-18
              </CheckBox>
              <CheckBox
                checked={data.zoning === 'r18g'}
                onClick={(e) => {
                  if (data.zoning === 'r18g') e.preventDefault()
                  if (e.currentTarget.checked) setData('zoning', 'r18g')
                }}
              >
                R-18G
              </CheckBox>
            </div>
          </div>
          <Tagger
            max={10}
            value={data.tags}
            onAdd={(v) => {
              if (v.length === 0) return
              setErrors('tags', '')
              if (data.tags && data.tags.length >= 10)
                return setErrors('tags', '???????????????10??????????????????????????????')
              if (data.tags && data.tags.includes(v)) return
              setData('tags', (prev) => [...(prev || []), v])
            }}
            onRemove={(tag) => {
              setData('tags', (prev) => (prev || []).filter((v) => v !== tag))
            }}
            error={errors['tags'] || ''}
            confirmKey={[' ']}
            suggestions={(value) => {
              return api.tags.search(value)
            }}
            placeholder="???????????????..."
          />
          <br />
          <HStack>
            <Button
              status={props.status}
              loading={loading()}
              onClick={async () => {
                const e: Record<string, string> = {}
                setErrors({})
                if (isEmpty(data.title)) {
                  e['title'] = '???????????????????????????'
                  setErrors('title', '???????????????????????????')
                }
                if (images().length < 1 && props.mode !== 'edit') {
                  e['image'] = '???????????????????????????????????????'
                  setErrors('image', '???????????????????????????????????????')
                }
                if (Object.keys(e).length > 0) {
                  setErrors(e)
                  return
                }
                setLoading(true)
                await props.onSubmit(data, information, images())
                setLoading(false)
              }}
            >
              {props.mode === 'post' ? '??????' : '??????'}
            </Button>
            <Show when={props.mode === 'edit'}>
              <Button
                class={css`
                  background-color: #ff6464;

                  &:hover {
                    background-color: #ffa2a2;
                  }
                `}
                onClick={() => (props as any).onDelete()}
              >
                ??????
              </Button>
            </Show>
          </HStack>
        </VStack>
      </div>
    </Container>
  )
}
