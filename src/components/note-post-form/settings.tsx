import type { UploadFile } from '@solid-primitives/upload'
import { createSignal, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import { css } from 'solid-styled-components'

import { NoteFormContext } from '.'
import { ImageUpload } from '../image-upload'
import { Tagger } from '../tagger'
import { Button } from '../ui/button'
import { CheckBox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { HStack } from '../ui/stack'

import { api } from '~/lib/api/supabase'

export const Settings = () => {
  const { data, setData, thumbnail, setThumbnail, post } = useContext(NoteFormContext)
  const [loading, setLoading] = createSignal(false)
  const [errors, setErrors] = createStore<Record<string, string>>({})
  return (
    <>
      <HStack
        class={css`
          justify-content: flex-end;
        `}
      >
        <CheckBox
          checked={!!data.published}
          onChange={(e) => setData('published', e.currentTarget.checked)}
        >
          公開
        </CheckBox>
        <Button
          onClick={async () => {
            setLoading(true)
            await post()
            setLoading(false)
          }}
          loading={loading()}
        >
          {data.published ? '公開する' : '下書き保存'}
        </Button>
      </HStack>
      <div>タイトル</div>
      <Input
        placeholder="タイトル"
        value={data.title || ''}
        onInput={(e) => setData('title', e.currentTarget.value)}
      />
      <br />
      <Tagger
        max={10}
        value={data.tags || []}
        onAdd={(v) => {
          if (v.length === 0) return
          setErrors('tags', '')
          if (data.tags && data.tags.length >= 10)
            return setErrors('tags', 'タグは最大10件まで登録できます。')
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
        placeholder="タグを入力..."
      />
      <Tagger
        max={10}
        value={data.prompts || []}
        onAdd={(v) => {
          if (v.length === 0) return
          setErrors('prompts', '')
          if (data.prompts && data.prompts.length >= 10)
            return setErrors('prompts', 'タグは最大10件まで登録できます。')
          if (data.prompts && data.prompts.includes(v)) return
          setData('prompts', (prev) => [...(prev || []), v])
        }}
        onRemove={(prompt) => {
          setData('prompts', (prev) => (prev || []).filter((v) => v !== prompt))
        }}
        error={errors['prompts'] || ''}
        confirmKey={[' ']}
        placeholder="関連するプロンプトを入力..."
      />
      <br />
      <div>サムネイル</div>
      <ImageUpload
        images={[thumbnail()].filter((v) => v) as UploadFile[]}
        onChange={(images) => {
          setThumbnail(images[0])
        }}
      />
    </>
  )
}
