import { styled } from 'decorock'
import { Component, createEffect, createMemo } from 'solid-js'
import { NoHydration } from 'solid-js/web'
import { A } from 'solid-start'
import { HttpStatusCode } from 'solid-start/server'

import { FixedTitle } from './head/title'
import { Button } from './ui/button'

interface HttpError {
  $title: string
  $code: number
}

const isHttpError = (error: any): error is HttpError => {
  return error.$title && error.$code
}

export class NotFoundError extends Error implements HttpError {
  $title = 'ページが見つかりませんでした'
  $code = 404
}

const Container = styled.div`
  display: flex;
  min-height: ${(p) => p.theme.alias.main_height};
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  background-color: ${(p) => p.theme.colors.bg_accent};

  & > div {
    text-align: center;
  }
`

const data = (error: any) => {
  const result = {} as {
    title: string
    code: number
  }
  if (isHttpError(error)) {
    result.title = error.$title
    result.code = error.$code
  } else {
    result.title = '不明なエラーが発生しました。'
    result.code = 500
  }
  return result
}

export const ErrorHandler: Component<{ error: any }> = (props) => {
  const error = createMemo(() => data(props.error))
  createEffect(() => console.error(props.error))
  return (
    <NoHydration>
      <FixedTitle>
        {error().title} - {error().code} | Aivy
      </FixedTitle>
      <HttpStatusCode code={error().code} />
      <Container>
        <div>
          <h1>{error().title}</h1>
          <A href="/">
            <Button>トップに戻る</Button>
          </A>
        </div>
      </Container>
    </NoHydration>
  )
}
