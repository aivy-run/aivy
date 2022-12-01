import { Outlet } from 'solid-start'

import { PostContainer } from '~/components/gallery/post-container'
import { FixedTitle } from '~/components/head/title'

export default function Ranking() {
  return (
    <>
      <FixedTitle>ランキング | Aivy</FixedTitle>
      <PostContainer>
        <Outlet />
      </PostContainer>
    </>
  )
}
