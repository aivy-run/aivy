import dayjs from 'dayjs'
import { createMemo } from 'solid-js'

import { Posts } from '~/components/gallery/posts'

export default function Daily() {
  const today = createMemo(() => dayjs(dayjs().format('YYYY-MM-DD')))
  return (
    <Posts
      title={today().format('MM月DD日') + 'のランキング'}
      ranking
      zoningButton
      tags
      all={50}
      url="/images/ranking/daily"
      filter={{
        build(builder) {
          builder.order('likes', { ascending: false })
          builder.gte('created_at', dayjs(today()).format())
        },
      }}
    />
  )
}
