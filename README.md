# Youtube動画要約

YouTubeチャンネルの最新動画を自動で要約する.

## 必要なアカウントと認証情報

1. [Cloudflareアカウント](https://dash.cloudflare.com/sign-up)
   - Workers & Pagesの利用登録が必要

2. [YouTube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com)の設定
   1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   2. プロジェクトの作成
      - 画面上部の「プロジェクトの選択」をクリック
      - 「新しいプロジェクト」をクリック
      - プロジェクト名を入力（例：`youtube-summarizer`）
      - 「作成」をクリック
   3. YouTube Data APIの有効化
      - 左メニューの「APIとサービス」→「ライブラリ」をクリック
      - 検索バーで「YouTube Data API v3」を検索
      - APIを選択し、「有効にする」をクリック
   4. 認証情報の作成
      - 左メニューの「APIとサービス」→「認証情報」をクリック
      - 「認証情報を作成」→「APIキー」をクリック
      - 作成されたAPIキーをコピーし、.dev.varsに設定する.（.dev.varsがなければ、.dev.vars.exampleをコピーして作成する）
   5. APIキーの制限設定（やらなくてもいい）
      - 作成したAPIキーをクリック
      - 「アプリケーションの制限」で「HTTPリファラー」を選択
      - 「ウェブサイトの制限」で使用するドメインを追加（例：`*.workers.dev`）
      - 「APIの制限」で「YouTube Data API v3」のみを選択
      - 「保存」をクリック

3. [Dify](https://dify.ai/)の設定
   1. アカウント作成
      - [Dify](https://dify.ai/)にアクセス
      - "Sign Up"をクリック
      - メールアドレスとパスワードを入力

   2. ワークフローの作成
      - DSLファイルをインポートから`dify/youtube-summarizer.yml`をインポート
      - Youtube Transcript APIがインストールされていないとできないので、マーケットプレイスから「search API」をインストールする.
        - 「承認するには」からAPIキーを取得し、入力する.
        - gpt-4oのノードをクリックし、コンテキストにyoutube transcript APIの出力を入れる.
      - [Slack API](https://api.slack.com/apps)にアクセス
        - "Create New App"をクリック
        - "From scratch"を選択
        - アプリ名（例：`Youtube Summarizer`）とワークスペースを選択
        - "Create App"をクリック
        - 左サイドバーの"Features"から"Incoming Webhooks"を選択
        - "Activate Incoming Webhooks"を"On"に切り替え
        - "Add New Webhook to Workspace"をクリック
        - 投稿先のチャンネルを選択し、"Allow"をクリック
        - 生成されたWebhook URLをコピー（`https://hooks.slack.com/services/...`の形式）
        - このWebhook URLを`dify/youtube-summarizer.yml`の`@WRITE_HERE`部分に設定する
        
        注意: 
        - このWebhook URLは秘密情報として扱い、GitHubなどに公開しない。
        - 一度作成したWebhook URLは後から確認することができない。安全な場所に保管する。
        - 誤ってURLを公開してしまった場合は、すぐに削除して新しいWebhookを作成する。
        
   3. API Keyの取得
      - 右上のプロフィールメニューから"API Keys"を選択
      - "Create API Key"をクリック
      - 作成されたAPIキーをコピーし、.dev.varsに設定する

## ローカル開発環境のセットアップ

1. リポジトリのクローンとパッケージのインストール
```bash
git clone [repository-url]
cd youtube-summarizer
npm install
```

2. 環境変数の設定
`.dev.vars`ファイルには以下のように設定される必要がある。
```
YOUTUBE_API_KEY=取得したAPIキー
YOUTUBE_CHANNEL_ID=チャンネルID
DIFY_API_KEY=取得したAPIキー
```

3. D1データベースのセットアップ
```bash
# データベースの作成
npx wrangler d1 create youtube-summarizer
```
作成後、以下のような出力が表示される：
```bash
✅ Successfully created DB 'youtube-summarizer'
Created D1 database 'youtube-summarizer' (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

表示されたデータベースIDを wrangler.toml の database_id に設定する：
```bash
[[d1_databases]]
binding = "DB"
database_name = "youtube-summarizer"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

# スキーマの適用（ローカル環境用）
```bash
npx wrangler d1 execute DB --local --file=./schema.sql
```

4. ローカルサーバーの起動
```bash
# 通常起動
npm run dev

# Cronトリガーのテスト用
npm run dev -- --test-scheduled
```

## ローカルテスト

1. ヘルスチェック
```bash
curl http://localhost:8787/health
```

2. 手動実行（推奨）
```bash
curl -X POST http://localhost:8787/post-video-summary-to-slack
```

3. Cronジョブのテスト
```bash
curl "http://localhost:8787/__scheduled?cron=*+*/6+*+*+*"
```

## デプロイ手順

1. Cloudflareへのログイン
```bash
npx wrangler login
```

2. 本番環境用データベースのセットアップ
```bash
# 本番環境用データベースの作成
npx wrangler d1 create youtube-summarizer
```
作成後、以下のような出力が表示される：
```bash
✅ Successfully created DB 'youtube-summarizer'
Created D1 database 'youtube-summarizer' (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

表示されたデータベースIDを wrangler.toml の本番環境用 database_id に設定する：
```bash
[[d1_databases]]
binding = "DB"
database_name = "youtube-summarizer"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

# スキーマの適用（本番環境用）
```bash
npx wrangler d1 execute DB --remote --file=./schema.sql
```

3. 環境変数（シークレット）の設定
wrangler.tomlのvarsに環境変数を設定する. wrangler.tomlをgithubに公開しないように注意する.


4. デプロイ
```bash
npx wrangler deploy
```
5. 定期実行のスパンを長くする
例として1日に1回実行する場合は、
```bash
[triggers]
crons = ["0 0 * * *"]
```
と設定し、
```bash
npx wrangler deploy
```
とする.

## 本番環境での操作
base url: https://youtube-summarizer.[your-subdomain].workers.dev.
これは、cloudflareのダッシュボードのWorkers & PagesのDomain & Routesのページで確認できる。

1. ヘルスチェック
```bash
curl -k https://youtube-summarizer.[your-subdomain].workers.dev/health
```

2. 手動実行
```bash
curl -k -X POST https://youtube-summarizer.[your-subdomain].workers.dev/post-video-summary-to-slack
```

3. データベース操作
```bash
# データの確認
npx wrangler d1 execute youtube-summarizer --command "SELECT * FROM processed_videos;" --remote

# データの削除
npx wrangler d1 execute youtube-summarizer --command "DELETE FROM processed_videos;" --remote
```

## モニタリング

- [Cloudflareダッシュボード](https://dash.cloudflare.com/)の"Workers & Pages"セクションで以下を確認できる：
  - 実行ログ
  - エラー
  - パフォーマンスメトリクス
  - Cronジョブの実行状況

## トラブルシューティング   

1. SSL/TLSエラーが発生する場合
   - デプロイ直後は証明書の伝播に時間がかかることがある
   - 一時的な対応として`curl -k`オプションを使用できる

2. データベースエラー
   - ローカル環境の場合は`--remote`フラグがないことを確認
   - 本番環境の場合は`--remote`フラグを付けることを確認

3. Cronジョブが実行されない
   - Cloudflareダッシュボードで"Trigger Events"の設定を確認
   - ログで実行状況を確認