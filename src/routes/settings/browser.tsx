import { css, useTheme } from 'decorock'
import { Show } from 'solid-js'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select } from '~/components/ui/select'
import { HStack } from '~/components/ui/stack'
import { useToast } from '~/components/ui/toast'
import { useBrowserSetting } from '~/hooks/use-browser-setting'
import type { BrowserSettings } from '~/types/settings'

export default function Browser() {
  const theme = useTheme()
  const toast = useToast()
  const [setting, setSetting, save, loaded] = useBrowserSetting()

  return (
    <Show when={loaded()}>
      <div
        class={css`
          & > h1 {
            font-size: 1.25rem;
          }

          & > p {
            font-size: 0.9rem;
          }
        `}
      >
        <div>この設定はブラウザ上に保存されるため別の端末と共有されません。</div>
        <br />
        <h1>画像サイズ</h1>
        <p>
          投稿ページで表示される画像の最大サイズです。
          <br />
          元の画像がこの解像度を上回る場合、自動で圧縮されます。
          <br />
          高い解像度に設定すると通信データを多く消費する可能性があります。
        </p>
        <br />
        <HStack
          class={css`
            width: 100%;
            ${theme.media.breakpoints.lg} {
              width: 50%;
            }
          `}
        >
          <Input
            value={setting.max_resolution.width}
            onInput={(e) => {
              const int = parseInt(e.currentTarget.value)
              if (!int) return e.preventDefault()
              setSetting('max_resolution', 'width', int)
            }}
          />
          <div>x</div>
          <Input
            value={setting.max_resolution.height}
            onInput={(e) => {
              const int = parseInt(e.currentTarget.value)
              if (!int) return e.preventDefault()
              setSetting('max_resolution', 'height', int)
            }}
          />
        </HStack>
        <br />
        <h1>カラーテーマ</h1>
        <p>※カラーテーマは再読み込み後に反映されます。</p>
        <br />
        <Select
          value={setting.theme || 'system'}
          items={[
            {
              key: 'system',
              label: 'システムの設定を使用',
            },
            {
              key: 'dark',
              label: 'ダークモード',
            },
            {
              key: 'light',
              label: 'ライトモード',
            },
          ]}
          onChange={(item) => setSetting('theme', item.key as BrowserSettings['theme'])}
        />
        <br />
        <Button
          onClick={() => {
            save()
            toast({
              title: '設定を保存しました。',
              description: '',
              status: 'success',
              isClosable: true,
            })
          }}
        >
          保存する
        </Button>
      </div>
    </Show>
  )
}
