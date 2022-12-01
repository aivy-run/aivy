import { createEffect, splitProps } from 'solid-js'
import { Title } from 'solid-start'

export const FixedTitle: typeof Title = (props) => {
  const [local, others] = splitProps(props, ['children'])
  createEffect(() => {
    import('solid-js/web').then(({ render }) => {
      let title = document.getElementsByTagName('title')[0]
      if (!title) {
        title = document.createElement('title')
        document.getElementsByTagName('head')[0]?.append(title)
      }
      title.innerHTML = ''
      render(() => <>{local.children}</>, title)
    })
  })
  return <Title {...others}>{local.children}</Title>
}
