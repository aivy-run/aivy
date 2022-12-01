import { Component, ComponentProps, createEffect, createSignal, JSX, splitProps } from 'solid-js'
import { css, useTheme } from 'solid-styled-components'

import { classnames } from '~/lib/classnames'
import IconBookmark from '~icons/carbon/bookmark-filled'
import IconFavorite from '~icons/carbon/favorite-filled'
type PropsT = Omit<ComponentProps<'svg'>, 'onClick'> & {
  selected?: boolean
  onClick?: (selected: boolean) => any
}

export const createBaseButton = (
  Comp: (props: ComponentProps<'svg'>) => JSX.Element,
  selectedColor: string,
  initialColor: string,
  borderColor: string,
): Component<PropsT> => {
  return (props) => {
    const [local, others] = splitProps(props, ['selected', 'class', 'height', 'width', 'onClick'])
    // eslint-disable-next-line solid/reactivity
    const [selected, setSelected] = createSignal(local.selected)
    createEffect(() => {
      setSelected(local.selected)
    })

    return (
      <Comp
        height={local.height || '25px'}
        width={local.width || '25px'}
        class={classnames(
          local.class,
          css`
            cursor: pointer;
            stroke: ${selected() ? 'none' : borderColor};
            stroke-width: 2px;

            path {
              fill: ${selected() ? selectedColor : initialColor};
            }
          `,
        )}
        onClick={() => {
          props.onClick?.(!!selected())
        }}
        {...others}
      />
    )
  }
}

export const FavButton: ReturnType<typeof createBaseButton> = (props) => {
  const theme = useTheme()
  const Comp = createBaseButton(
    IconFavorite,
    '#ff4060',
    theme.$().colors.bg_accent.string(),
    theme.$().colors.text.string(),
  )
  return <Comp {...props} />
}
export const BookmarkButton: ReturnType<typeof createBaseButton> = (props) => {
  const theme = useTheme()
  const Comp = createBaseButton(
    IconBookmark,
    '#5d85b9',
    theme.$().colors.bg_accent.string(),
    theme.$().colors.text.string(),
  )
  return <Comp {...props} />
}
