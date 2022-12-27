import { createFileUploader, UploadFile } from '@solid-primitives/upload'
import { css, useTheme } from 'decorock'
import { createEffect, createSignal, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Line } from '~/components/ui/line'
import { VStack } from '~/components/ui/stack'
import { TextArea } from '~/components/ui/textarea'
import { useToast } from '~/components/ui/toast'
import { useUser } from '~/context/user'
import {
  createDirectUploadUrl,
  createImageURL,
  deleteCache,
  fetchImage,
  uploadImage,
} from '~/lib/api/cloudflare'
import type { UserProfile } from '~/lib/api/supabase/user'
import { createUserOgp } from '~/lib/image/user-ogp'

export default function Profile() {
  const theme = useTheme()
  const toast = useToast()
  const {
    accessor: [, profile],
    setter: [updateProfile],
    status: { isFetching },
  } = useUser()

  const [updates, setUpdates] = createStore({} as UserProfile['Update'])
  const [tmpIconSource, setTmpIconSource] = createSignal('')
  const [tmpIcon, setTmpIcon] = createSignal<UploadFile>()
  const [tmpHeaderSource, setTmpHeaderSource] = createSignal('')
  const [tmpHeader, setTmpHeader] = createSignal<UploadFile>()
  const [loading, setLoading] = createSignal(false)
  const [status, setStatus] = createSignal('')
  const { selectFiles: selectHeaderFiles } = createFileUploader({ accept: 'image/*' })
  const { selectFiles: selectIconFiles } = createFileUploader({ accept: 'image/*' })

  createEffect(() => {
    setUpdates({ ...profile() })
  })

  return (
    <Show when={!isFetching()}>
      <div
        class={css`
          width: 100%;
          gap: 1rem;
        `}
      >
        <VStack>
          <div
            class={css`
              width: 100%;
              background-color: ${theme.colors.text.fade(0.9)};

              img {
                width: 100%;
                height: auto;
                aspect-ratio: 3/1;
                object-fit: cover;
                vertical-align: top;
              }
            `}
          >
            <img
              src={tmpHeaderSource() || createImageURL(`user.header.${profile().uid}`, 'header')}
              alt=""
            />
          </div>
          <Button
            onClick={() => {
              selectHeaderFiles(async (files) => {
                if (files.length < 1) return
                const file = files[0]!
                setTmpHeaderSource(file.source)
                setTmpHeader(file)
              })
            }}
          >
            ヘッダー画像を選択
          </Button>
        </VStack>
        <br />
        <Line />
        <br />
        <div
          class={css`
            display: flex;
            width: 100%;
            flex-wrap: wrap;
            align-items: center;
            margin-top: 1rem;
            gap: 1rem;
          `}
        >
          <VStack
            class={css`
              width: 100%;
              ${theme.media.breakpoints.lg} {
                width: 40%;
              }
            `}
          >
            <img
              src={tmpIconSource() || createImageURL('user.icon.' + profile().uid, 'icon')}
              alt=""
              class={css`
                width: 256px;
                height: 256px;
                border: 1px solid black;
                border-radius: 50%;
                object-fit: cover;
                opacity: ${profile().uid ? '1' : '0'};
                transition: 0.2s;
              `}
            />
            <Button
              onClick={() => {
                selectIconFiles((files) => {
                  if (files.length < 1) return
                  const file = files[0]!
                  setTmpIconSource(file.source)
                  setTmpIcon(file)
                })
              }}
            >
              画像を選択
            </Button>
          </VStack>
          <VStack
            class={css`
              display: inline-flex;
              width: 100%;
              align-items: flex-start;
              ${theme.media.breakpoints.lg} {
                width: 50%;
              }

              textarea {
                width: 100%;
                resize: none;
              }
            `}
          >
            <h3>プロフィール設定</h3>
            <br />
            <div>ユーザー名</div>
            <Input
              value={updates.username || ''}
              onInput={(e) => setUpdates('username', e.currentTarget.value)}
            />
            <div>自己紹介</div>
            <TextArea
              maxLength={150}
              value={updates.introduction || ''}
              onInput={(e) => setUpdates('introduction', e.currentTarget.value)}
            />
            <br />
            <div>TwitterID</div>
            <Input
              value={updates.twitter || ''}
              onInput={(e) => setUpdates('twitter', e.currentTarget.value)}
            />
          </VStack>
        </div>
        <br />
        <div
          class={css`
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;
            grid-column: 1/3;
          `}
        >
          <Button
            loading={loading()}
            status={status()}
            onClick={async () => {
              setLoading(true)
              const icon = tmpIcon()
              const header = tmpHeader()
              if (icon) {
                setStatus('アイコン画像をアップロード中')
                const id = `user.icon.${profile().uid}`
                const res = await fetchImage(id)
                if (res.ok) await fetchImage(id, { method: 'DELETE' })
                const url = await createDirectUploadUrl()
                await uploadImage(url, icon.file, id)
                await deleteCache(id, 'icon')
              }
              if (header) {
                setStatus('ヘッダー画像をアップロード中')
                const id = `user.header.${profile().uid}`
                const res = await fetchImage(id)
                if (res.ok) await fetchImage(id, { method: 'DELETE' })
                const url = await createDirectUploadUrl()
                await uploadImage(url, header.file, id)
                await deleteCache(id, 'header')
              }
              setStatus('OGP画像を生成中')
              const ogpId = `user.ogp.${profile().uid}`
              const res = await fetchImage(ogpId)
              if (res.ok) await fetchImage(ogpId, { method: 'DELETE' })
              try {
                const ogp = await createUserOgp(profile(), header, icon)
                const url = await createDirectUploadUrl()
                await uploadImage(url, new File([ogp], 'ogp.png'), ogpId)
                await deleteCache(ogpId, 'ogp')
              } catch (_) {}

              setStatus('プロフィールを更新中')
              await updateProfile({ ...updates })
              toast({
                title: '設定を更新しました。',
                description: '反映までに1-2分かかる場合があります。',
                isClosable: true,
                status: 'success',
              })
              setStatus('')
              setLoading(false)
            }}
          >
            更新する
          </Button>
        </div>
      </div>
    </Show>
  )
}
