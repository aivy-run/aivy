import type { UploadFile } from '@solid-primitives/upload'
import Color from 'color'
import exifr from 'exifr'
import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { css, styled, useTheme } from 'solid-styled-components'

import { Tab, Tabs } from '../ui/tab'
import { ContestSelect } from './contest-select'
import { ImageInformationForm } from './image-information'

import { ImageUpload } from '~/components/image-post-form/image-upload'
import { AutoComplete } from '~/components/ui/auto-complete'
import { Button } from '~/components/ui/button'
import { CheckBox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Required } from '~/components/ui/required'
import { HStack, VStack } from '~/components/ui/stack'
import { Tag } from '~/components/ui/tag'
import { TextArea } from '~/components/ui/textarea'
import { createImageURL } from '~/lib/api/cloudflare'
import { api } from '~/lib/api/supabase'
import type { CompleteImagePost, ImageInformation, ImagePost } from '~/lib/api/supabase/images'
import { parseExif } from '~/lib/parse-exif'

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0;
  ${(p) => p.theme?.$().media.breakpoints.md} {
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
          initial: CompleteImagePost
          onDelete: () => void
        }
    )

const isEmpty = (v?: string) => !v || !v.match(/\S/g)

export const ImagePostUploader: Component<Props> = (props) => {
  const theme = useTheme()
  const [images, setImages] = createSignal<UploadFile[]>([])
  const [selected, setSelected] = createSignal(0)
  const [currentTag, setCurrentTag] = createSignal('')
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
      const { information, profiles: _, ...others } = props.initial
      setData(others)
      setInformation(information)
      setImages(
        information.map(
          (v) =>
            ({
              source: createImageURL(`post.image.${props.initial.id}.${v.index}`),
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
          background-color: ${theme.$().colors.bg_accent.string()};
          text-align: center;
          ${theme.$().media.breakpoints.md} {
            width: 80%;
            min-height: none;
            border-radius: 0.5rem;
            border-top: none;
          }
        `}
      >
        <Show when={props.mode === 'post'}>
          <h2>画像をアップロード</h2>
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
              setErrors('image', '100枚を超える画像は投稿できません。')
              return
            }
            const filtered: UploadFile[] = []
            for (const [i, file] of Object.entries(files)) {
              if (file.file.size > 10485760) {
                setErrors('image', 'ファイルサイズは10MB以下である必要があります。')
                continue
              }
              filtered.push(file)

              const exif = await exifr.parse(file.source)
              const info = { ...(autoLoad() ? parseExif(exif) : {}) }
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
              color: ${Color('red').lighten(0.25).string()};
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
              画像情報を自動で読み取る
            </CheckBox>
          </Show>
          <CheckBox checked={autoCopy()} onChange={(e) => setAutoCopy(e.currentTarget.checked)}>
            全ての画像情報を編集する
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
                      {i() + 1}枚目
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
            placeholder="タイトル"
            value={data.title || ''}
            onInput={(e) => setData('title', e.currentTarget.value)}
          />
          <TextArea
            class={css`
              width: 100%;
            `}
            placeholder="説明"
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
                ${theme.$().media.breakpoints.lg} {
                  flex-direction: row;
                  gap: 5rem;
                }
              `}
            >
              <h3>年齢制限</h3>
              <CheckBox
                checked={data.zoning === 'normal'}
                onClick={(e) => {
                  if (data.zoning === 'normal') e.preventDefault()
                  if (e.currentTarget.checked) setData('zoning', 'normal')
                }}
              >
                全年齢
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
          <div
            class={css`
              display: flex;
              width: 100%;
              min-height: 50px;
              flex-wrap: wrap;
              align-items: center;
              gap: 1rem;
            `}
          >
            <For each={data.tags}>
              {(tag) => (
                <Tag
                  class={css`
                    user-select: none;
                  `}
                  removable={true}
                  onRemove={() => setData('tags', (prev) => (prev || []).filter((v) => v !== tag))}
                >
                  {tag}
                </Tag>
              )}
            </For>
          </div>
          <div
            class={css`
              width: 100%;
              font-weight: bold;
              text-align: right;
            `}
          >
            {data.tags?.length}/10
          </div>
          <AutoComplete
            class={css`
              width: 100%;
            `}
            placeholder="タグを入力..."
            value={currentTag()}
            error={errors['tags'] || ''}
            confirmKey={[' ']}
            onInput={(v) => setCurrentTag(v)}
            suggestions={(value) => {
              return api.tags.search(value)
            }}
            onChange={(v) => {
              if (v.length === 0) return
              setErrors('tags', '')
              setCurrentTag('')
              if (data.tags && data.tags.length >= 10)
                return setErrors('tags', 'タグは最大10件まで登録できます。')
              if (data.tags && data.tags.includes(v)) return
              setData('tags', (prev) => [...(prev || []), v])
            }}
          />
          <br />
          <Show when={props.mode === 'post'}>
            <ContestSelect
              onSelect={(id) => {
                if (id) setData('contest_id', id)
                else setData('contest_id', undefined)
              }}
            />
          </Show>
          <br />
          <HStack>
            <Button
              status={props.status}
              loading={loading()}
              onClick={async () => {
                const e: Record<string, string> = {}
                setErrors({})
                if (isEmpty(data.title)) {
                  e['title'] = 'タイトルが空です。'
                  setErrors('title', 'タイトルが空です。')
                }
                if (images().length < 1 && props.mode !== 'edit') {
                  e['image'] = '画像が選択されていません。'
                  setErrors('image', '画像が選択されていません。')
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
              {props.mode === 'post' ? '投稿' : '更新'}
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
                削除
              </Button>
            </Show>
          </HStack>
        </VStack>
      </div>
    </Container>
  )
}
