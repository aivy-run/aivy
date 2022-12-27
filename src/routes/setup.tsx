import { createFileUploader } from '@solid-primitives/upload'
import dayjs from 'dayjs'
import { css, styled, useTheme } from 'decorock'
import { createEffect, createSignal, on } from 'solid-js'
import { createStore } from 'solid-js/store'
import { useNavigate } from 'solid-start'

import { FixedTitle } from '~/components/head/title'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { VStack } from '~/components/ui/stack'
import { TextArea } from '~/components/ui/textarea'
import { useToast } from '~/components/ui/toast'
import { useUser } from '~/context/user'
import { createDirectUploadUrl, uploadImage } from '~/lib/api/cloudflare'
import { supabase } from '~/lib/api/supabase/client'
import type { UserProfile } from '~/lib/api/supabase/user'

const Container = styled.div`
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
`
const parseIconURL = (url_str: string) => {
  if (!url_str) return url_str
  const url = new URL(url_str)
  if (url.host !== 'pbs.twimg.com') return url_str
  const filename = url.pathname.split('/').slice(-1)[0]
  if (!filename) return url_str
  return url_str.replace(filename, filename.replace('_normal', ''))
}

export default function Setup() {
  const toast = useToast()
  const theme = useTheme()
  const navigate = useNavigate()
  const {
    accessor: [user, profile],
  } = useUser(true)
  const { selectFiles } = createFileUploader({ accept: 'image/*' })
  const [iconSource, setIconSource] = createSignal('')
  const [icon, setIcon] = createSignal<File>()
  const [id, setId] = createSignal('')
  const [username, setUsername] = createSignal('')
  const [introduction, setIntroduction] = createSignal('')
  const [pending, setPending] = createSignal(false)
  const [errors, setErrors] = createStore({} as Record<string, string>)

  createEffect(() => {
    if (profile())
      navigate('/', {
        replace: true,
      })
  })

  createEffect(
    on(user, async (me) => {
      if (!me) return navigate('/sign')
      const source = parseIconURL(me.user_metadata?.['picture'])
      setIconSource(source)
      const ext = source.split('.').slice(-1)[0]
      const res = await fetch(source)
      setIcon(new File([await res.blob()!], `file.${ext}`))
    }),
  )

  return (
    <>
      <FixedTitle>セットアップ | Aivy</FixedTitle>
      <Container>
        <VStack
          class={css`
            width: 100%;
            padding: 1rem 4rem;
            border-radius: 1rem;
            background-color: ${theme.colors.bg_accent};
            opacity: ${!profile() ? '1' : '0'};
            text-align: center;
            transition: 0.2s;

            ${theme.media.breakpoints.lg} {
              width: 50%;
            }

            h2 {
              margin-bottom: 1rem;
            }

            textarea {
              width: 100%;
            }
          `}
        >
          <h2>Aivyへようこそ！</h2>

          <VStack gap={'0.25rem'}>
            <img
              src={iconSource()}
              width={256}
              height={256}
              class={css`
                border: 1px solid black;
                border-radius: 50%;
                opacity: ${icon() ? '1' : '0'};
                transition: 0.2s;
              `}
              alt=""
            />
            <Button
              onClick={() =>
                selectFiles((files) => {
                  if (files.length < 1) return
                  const file = files[0]!
                  setIconSource(file.source)
                  setIcon(file.file)
                })
              }
            >
              画像を選択
            </Button>
          </VStack>

          <Input
            placeholder="ニックネーム"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            error={errors['username']}
          />
          <Input
            placeholder="ユーザーID"
            value={id()}
            onInput={(e) => setId(e.currentTarget.value)}
            error={errors['id']}
          />
          <TextArea
            maxLength={150}
            placeholder="自己紹介"
            value={introduction()}
            onInput={(e) => setIntroduction(e.currentTarget.value)}
          />

          <p>※ユーザーIDは後から変更できません。</p>

          <Button
            loading={pending()}
            onClick={async () => {
              setPending(true)
              const me = user()
              if (!me)
                return toast({
                  title: 'ユーザーの取得に失敗しました。',
                  description: 'ログインからやり直してください。',
                  status: 'error',
                  duration: 1000 * 10,
                  isClosable: true,
                })

              setErrors({})
              const errors: Record<string, string> = {}
              if (!id()) {
                errors['id'] = 'ユーザーIDが空です。'
              } else if (!id().match(/^[a-z_0-9|-]{1,30}$/i)) {
                errors['id'] = 'ユーザーIDに使用できない文字が含まれています'
              }
              if (!username()) {
                errors['username'] = 'ユーザー名が空です'
              }
              if (Object.keys(errors).length > 0) {
                setErrors(errors)
                setPending(false)
                return
              }

              const exists = await supabase.from('profiles').select('id').eq('id', id()).single()
              if (exists.data?.id === id()) {
                toast({
                  title: 'ユーザー名がすでに使用されています',
                  description: 'ユーザー名を変更してお試しください。',
                  status: 'error',
                  duration: 1000 * 10,
                  isClosable: true,
                })
                return setPending(false)
              }

              const updates: UserProfile['Insert'] = {
                id: id().toLowerCase(),
                updated_at: dayjs().format(),
                uid: me.id,
                username: username(),
                introduction: introduction(),
                twitter: me.user_metadata['user_name'],
              }
              const { error } = await supabase.from('profiles').upsert(updates)
              if (error) {
                toast({
                  title: 'サーバーエラー',
                  description: 'サーバー上でエラーが発生しました。もう一度やり直してください。',
                  status: 'error',
                  duration: 1000 * 10,
                  isClosable: true,
                })
                setPending(false)
                return
              }

              const uploadId = `user.icon.${me.id}`
              const url = await createDirectUploadUrl()
              await uploadImage(url, icon()!, uploadId)

              window.location.href = '/'
              setPending(false)
            }}
          >
            はじめる
          </Button>
          <div
            class={css`
              color: ${theme.colors.text.fade(0.25)};
              cursor: pointer;

              &:hover {
                text-decoration: underline;
              }
            `}
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
          >
            登録を中断する
          </div>
        </VStack>
      </Container>
    </>
  )
}
