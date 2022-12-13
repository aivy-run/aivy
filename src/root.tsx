// @refresh reload
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Component, JSX, Suspense } from 'solid-js'
import { useAssets } from 'solid-js/web'
import { SolidNProgress } from 'solid-progressbar'
import {
  ErrorBoundary,
  Body,
  FileRoutes,
  Html,
  Head,
  Routes,
  Scripts,
  Meta,
  Link,
  Title,
} from 'solid-start'
import { extractCss, styled } from 'solid-styled-components'

import { ErrorHandler } from './components/error-handler'
import { Footer } from './components/footer'
import { Header } from './components/header'
import { Maintenance } from './components/maintenance'
import { ModalProvider } from './components/ui/modal'
import { ToastProvider } from './components/ui/toast'
import { UserProvider } from './context/user'
import { ThemeProvider } from './styles/theme'

import 'dayjs/locale/ja'

import './styles/global.css'
import 'solid-slider/slider.css'

dayjs.locale('ja')
dayjs.extend(duration)

const Providers: Component<{ children: JSX.Element }> = (props) => (
  <ThemeProvider>
    <ToastProvider>
      <ModalProvider>
        <UserProvider>{props.children}</UserProvider>
      </ModalProvider>
    </ToastProvider>
  </ThemeProvider>
)

const Container = styled.div`
  min-height: 100vh;

  & > main {
    min-height: ${(p) => p.theme?.$().alias.main_height};
  }
`

const Root = () => {
  useAssets(() => `<style id="_goober">${extractCss()}</style>`)

  return (
    <Html lang="ja">
      <Head>
        <Meta charset="utf-8" />
        <Link rel="canonical" href="https://aivy.run" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />

        <Title>Aivy | AI作品に特化した画像投稿サービス</Title>
        <Meta name="description" content="Aivyは、AI作品に特化した画像投稿サービスです。" />

        <Meta property="og:site_name" content="Aivy" />
        <Meta property="og:title" content="Aivy" />
        <Meta property="og:description" content="Aivyは、AI作品に特化した画像投稿サービスです。" />
        <Meta property="og:url" content="https://aivy.run" />
        <Meta property="og:type" content="website" />
        <Meta property="og:image" content="https://aivy.run/icons/dark.png" />
        <Meta name="twitter:card" content="summary" />
        <Meta name="twitter:site" content="@aivy" />

        <Link rel="icon" href="/icons/transparent.png" />
        <Link rel="preconnect" href="https://fonts.googleapis.com" />
        <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <Link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${
            import.meta.env['VITE_ADSENSE_ID']
          }`}
          crossorigin="anonymous"
        />
      </Head>
      <Body>
        <Providers>
          <SolidNProgress color="#3ea8ff" />
          <Container>
            <Header />
            <ErrorBoundary fallback={(err) => <ErrorHandler error={err} />}>
              <main>
                <Suspense>
                  <Maintenance>
                    <Routes>
                      <FileRoutes />
                    </Routes>
                  </Maintenance>
                </Suspense>
              </main>
            </ErrorBoundary>
            <Footer />
          </Container>
        </Providers>
        <Scripts />
      </Body>
    </Html>
  )
}

export default Root
