import { css, useTheme } from 'decorock'
import { Component, For } from 'solid-js'
import { A } from 'solid-start'

import { useImagePost } from '.'
import { IconImg } from '../ui/icon-img'
import { Tag } from '../ui/tag'

export const MetaInfo: Component = () => {
  const { post } = useImagePost()

  return (
    <div>
      <div
        class={css`
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        `}
      >
        <For each={post.tags}>
          {(tag) => (
            <A href={'/search?q=' + encodeURIComponent(`(tag:${tag})`)}>
              <Tag>{tag}</Tag>
            </A>
          )}
        </For>
      </div>
      <h1>{post.title}</h1>
      <p>
        <For each={post.description?.split(/\n/g)}>
          {(line) => (
            <>
              {line}
              <br />
            </>
          )}
        </For>
      </p>
    </div>
  )
}

export const UserInfo: Component = () => {
  const { post } = useImagePost()
  const theme = useTheme()
  return (
    <div
      class={css`
        margin-top: 0.5rem;

        a {
          display: inline-flex;
          align-items: center;
          color: ${theme.colors.text};
          gap: 0.5rem;

          & > div {
            font-size: 1rem;
            font-weight: bold;
          }
        }
      `}
    >
      <A href={`/users/${post.profiles.id}`}>
        <IconImg
          userId={post.profiles.uid}
          alt=""
          width={50}
          height={50}
          class={css`
            width: 25px;
            height: 25px;
            border: 0.5px solid black;
            border-radius: 50%;
          `}
        />
        <div>{post.profiles.username}</div>
      </A>
    </div>
  )
}
