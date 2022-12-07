import dayjs from 'dayjs'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { A } from 'solid-start'
import { styled } from 'solid-styled-components'

import { Posts } from '~/components/gallery/posts'
import { FixedTitle } from '~/components/head/title'
import { InternalAD } from '~/components/internal-ad'
import { Tags } from '~/components/tags'
import { ZoningSelector } from '~/components/zoning-selector'
import { useUser } from '~/context/user'
import { api } from '~/lib/api/supabase'
import type { Zoning } from '~/lib/api/supabase/user'

const Container = styled.div`
  padding: 0;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    padding: 1rem 10rem;
  }
`

const Inner = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${(p) => p.theme?.$().colors.text.fade(0.5).string()};
  background-color: ${(p) => p.theme?.$().colors.bg_accent.string()};
  text-align: center;
  ${(p) => p.theme?.$().media.breakpoints.lg} {
    border-radius: 0.5rem;
    border-bottom: none;
    margin-bottom: 1rem;
  }
`

const MoreButton = styled(A)`
  margin: 1rem 0;
  color: ${(p) => p.theme?.$().colors.main.darken(0.25).string()};
  font-weight: 500;
  text-underline-offset: 0.1rem;

  &:hover {
    text-decoration: underline;
  }
`

export default function Index() {
  const {
    util: { withUser },
  } = useUser(true)
  const [following, setFollowing] = createSignal([] as string[])
  const [zoning, setZoning] = createSignal<Zoning[]>(['normal'])
  const today = createMemo(() => dayjs(dayjs().format('YYYY-MM-DD')))

  createEffect(() => {
    withUser(async ([me]) => {
      const follows = await api.relationship.getRelationships({ authors: [me.id] })
      setFollowing(follows.map((v) => v.target))
    })
  })

  return (
    <>
      <>
        <FixedTitle>Aivy | AI作品に特化した画像投稿サービス</FixedTitle>
      </>
      <Container>
        <InternalAD />
        <Tags />
        <ZoningSelector onChange={setZoning} />
        <Inner>
          <Posts
            title={today().format('MM月DD日') + 'のランキング'}
            all={6}
            ranking={true}
            pagination={false}
            filter={{
              zoning: zoning(),
              build(builder) {
                builder.order('likes', { ascending: false })
                builder.gte('created_at', dayjs(today()).format())
              },
            }}
          />
          <MoreButton href="/images/ranking/daily">もっと見る→</MoreButton>
        </Inner>
        <Inner>
          <Posts
            title="新着"
            all={20}
            pagination={false}
            filter={{ zoning: zoning(), latest: true }}
          />
          <MoreButton href="/images/latest">もっと見る→</MoreButton>
        </Inner>
        <Show when={following().length > 0}>
          <Inner>
            <Posts
              title="フォロー中"
              all={5}
              pagination={false}
              filter={{
                zoning: zoning(),
                latest: true,
                authorOr: following(),
              }}
            />
            <MoreButton href="/images/following">もっと見る→</MoreButton>
          </Inner>
        </Show>
        <Inner>
          <Posts
            title={today().format('MM月') + 'のランキング'}
            all={6}
            ranking={true}
            pagination={false}
            filter={{
              zoning: zoning(),
              build(builder) {
                builder.order('likes', { ascending: false })
                builder.gte('created_at', dayjs(today().format('YYYY-MM-01')).format())
              },
            }}
          />
          <MoreButton href="/images/ranking/monthly">もっと見る→</MoreButton>
        </Inner>
      </Container>
    </>
  )
}
