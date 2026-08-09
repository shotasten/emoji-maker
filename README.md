# 絵文字メーカー


<a href="https://emoji-maker.shotaste.com"><img src="public/cho-kantan.png" width="23%"></a><a href="https://emoji-maker.shotaste.com"><img src="public/shunkan-seisei.png" width="23%"></a><a href="https://emoji-maker.shotaste.com"><img src="public/emoji.png" width="23%"></a><a href="https://emoji-maker.shotaste.com"><img src="public/maker.png" width="23%"></a>

https://emoji-maker.shotaste.com

Slack・Discord・Teams のカスタム絵文字をブラウザで作れるツール。リアルタイムプレビューで確認しながらデザインできる。

## 機能

- テキストを入力して絵文字を生成
- フォント・文字色・背景色・縁取りをカスタマイズ
- Slack/Discord 風のチャットプレビュー（ライト・ダーク）
- 180×180px の PNG でダウンロード
- PWA 対応

## 開発

```bash
npm ci
npm run dev
```

依存関係を変更した場合は、`package.json` と `package-lock.json` を同じ変更に含めてください。
依存関係のインストールには、lockfileを厳密に反映する `npm ci` を使用します。

## ビルド

```bash
npm run build
```

## アセット生成

```bash
npm run gen-icons   # PWAアイコン
npm run gen-og      # OGP画像
```

## デプロイ

Cloudflare Pages。`main` push で自動デプロイ。

## 広告

Google AdSense の自動広告タグを `pages/_document.tsx` で `APP_ENV=prd` のときのみ全ページの `<head>` に出力します。Cloudflare Pages の Production 環境に `APP_ENV=prd` を設定し、Preview やローカルでは未設定のままにします。広告配信では Cookie などが利用される場合があります。
