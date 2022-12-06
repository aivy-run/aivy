import { createSignal, Show } from 'solid-js'
import { A } from 'solid-start'
import { css, styled, useTheme } from 'solid-styled-components'

import { IconImg } from '../ui/icon-img'
import { Line } from '../ui/line'

import { useUser } from '~/context/user'
import { useFloating } from '~/hooks/use-floating'
import { signOut } from '~/lib/api/internal/auth'
import { classnames } from '~/lib/classnames'
import IconAddAlt from '~icons/carbon/add-alt'
import IconBookmark from '~icons/carbon/bookmark'
import IconImage from '~icons/carbon/image'
import IconSettings from '~icons/carbon/settings'

const Container = styled.div`
  position: absolute;
  z-index: 10;
  top: 100%;
  right: 0;
  overflow: hidden;
  width: 200px;
  border-radius: 0.5rem;
  margin-top: 1rem;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
`

const MenuItem = styled.div<{ loading?: boolean }>`
  display: flex;
  width: 100%;
  height: 40px;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  color: ${(p) =>
    p.theme
      ?.$()
      .colors.text.fade(p.loading ? 0.5 : 0)
      .string()};
  cursor: pointer;
  font-weight: bold;
  grid-template-columns: 25px 1fr;
  outline: none;
  text-decoration: none;
  transition: 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
  }

  span {
    display: inline-flex;
    width: 25px;
    height: 100%;
    align-items: center;
  }
`

export const Menu = () => {
  const {
    accessor: [, profile],
    status: { isFetching },
  } = useUser()
  const [loading, setLoading] = createSignal(false)
  const theme = useTheme()

  let ref: HTMLDivElement
  const [open, setOpen] = useFloating(() => ref!)

  const toggle = () => {
    setOpen(!open())
  }

  const style_button = css`
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background-color: ${theme.$().colors.bg_accent.string()};
    cursor: pointer;
    outline: none;
    transition: 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.15);
    }
  `

  return (
    <Show when={!isFetching()}>
      <IconImg userId={profile().uid} height={512} width={512} alt="" onClick={toggle} />
      <Container
        ref={ref!}
        class={css`
          opacity: ${open() ? '1' : '0'};
          pointer-events: ${open() ? 'all' : 'none'};
        `}
      >
        <A href={`/users/${profile().id}/`} state={{ user: profile }} onClick={toggle}>
          <div
            class={classnames(
              style_button,
              css`
                padding: 0.5rem;
                color: ${theme.$().colors.text.string()};

                h2 {
                  font-size: 1rem;
                }

                p {
                  color: ${theme.$().colors.text.fade(0.25).string()};
                  font-size: 0.75rem;
                }
              `,
            )}
          >
            <h2>{profile().username}</h2>
            <p>@{profile().id}</p>
          </div>
        </A>
        <Line />
        <A href="/upload" onClick={toggle}>
          <MenuItem>
            <span>
              <IconAddAlt />
            </span>
            画像を投稿
          </MenuItem>
        </A>
        <A href="/dashboard/images" onClick={toggle}>
          <MenuItem>
            <span>
              <IconImage />
            </span>
            投稿を管理
          </MenuItem>
        </A>
        <A href="/dashboard/bookmarks" onClick={toggle}>
          <MenuItem>
            <span>
              <IconBookmark />
            </span>
            ブックマーク
          </MenuItem>
        </A>
        <Line />
        <A href="/settings/account" onClick={toggle}>
          <MenuItem>
            <span>
              <IconSettings />
            </span>
            <p>アカウント設定</p>
          </MenuItem>
        </A>
        <Line />
        <MenuItem
          class={style_button}
          loading={loading()}
          onClick={async () => {
            setLoading(true)
            await signOut()
            setTimeout(() => {
              setLoading(false)
              window.location.href = window.location.protocol + '//' + window.location.host + '/'
            }, 1000)
          }}
        >
          <p>ログアウト</p>
        </MenuItem>
      </Container>
    </Show>
  )
}
