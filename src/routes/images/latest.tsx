import { Meta } from 'solid-start'

import { PostContainer } from '~/components/gallery/post-container'
import { Posts } from '~/components/gallery/posts'
import { FixedTitle } from '~/components/head/title'

export default function Latest() {
  return (
    <>
      <>
        <FixedTitle>最新の投稿</FixedTitle>
        <Meta property="og:title" content="最新の投稿一覧です。" />
      </>
      <PostContainer>
        <Posts
          title="最新の投稿"
          all={50}
          url="/images/latest"
          filter={{
            latest: true,
          }}
        />
      </PostContainer>
    </>
  )
}
