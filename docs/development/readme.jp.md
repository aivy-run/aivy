# 開発ドキュメント

## 環境

- docker
- nodejs v16
- pnpm
- supabase cli

### 必要なもの

- Twitter api のキーとシークレットキー

※Cloudflare Images について  
現在エミュレーションする手段がないため画像投稿の処理部分の開発はできません。
今後、CloudflareImages の簡易的なエミュレータを作成する予定です。

## 手順

### 開発サーバーの起動

1. このリポジトリをクローン
2. ディレクトリに入って`pnpm i` を実行し、パッケージをインストール
3. `.env.template` を参考に、`.env` ファイルを作成
4. `TWITTER_API_KEY`, `TWITTER_API_SECRET` の二つの環境変数を読み込んだ状態で、`supabase start` を実行。(Docker 必須)
5. URL と AnonKey を確認して`.env` に追記
6. `pnpm dev` を実行して開発サーバーを起動

### データベースの変更を保存

1. `supabase gen types typescript --local > supabase/database.types.ts` を実行して TypeScript の型定義を更新
2. `supabase db diff --use-migra -f <コミットメッセージ>` を実行して変更内容をファイルに出力

## わからないことがあったら

公式の Discord サーバーにてお問い合わせください
[![](/docs/images/discord-invite.png)](https://discord.gg/9NqyGWHHQu)
