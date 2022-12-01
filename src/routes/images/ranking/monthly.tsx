import dayjs from 'dayjs'
import { createMemo } from 'solid-js'

import { Posts } from '~/components/gallery/posts'

export default function Daily() {
  const today = createMemo(() => dayjs(dayjs().format('YYYY-MM-DD')))
  return (
    <Posts
      title={today().format('MM月') + 'のランキング'}
      all={50}
      ranking={true}
      url="/images/ranking/monthly"
      filter={{
        zoning: ['normal'],
        build(builder) {
          builder.order('likes', { ascending: false })
          builder.gte('created_at', dayjs(today().format('YYYY-MM-01')).format())
        },
      }}
    />
  )
}
