import { styled } from 'decorock'
import { A } from 'solid-start'

import { FixedTitle } from '~/components/head/title'
import { Button } from '~/components/ui/button'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  margin-top: 4rem;
  background-color: ${(p) => p.theme.colors.bg_accent};
`

export default function Support() {
  return (
    <>
      <FixedTitle>お問い合わせ | Aivy</FixedTitle>
      <Container>
        <div>
          <h1>お問い合わせについて</h1>
          <p>現在お問い合わせは、Discordサーバーで受け付けております。</p>
        </div>
        <div>
          <A href="https://discord.gg/9NqyGWHHQu">
            <Button>参加する</Button>
          </A>
        </div>
      </Container>
    </>
  )
}
