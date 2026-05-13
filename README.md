# 絵文字メーカー

https://emoji-maker.shotaste.com

Slack・Discord・Teams のカスタム絵文字をブラウザで作れるツール。

## 機能

- テキストを入力して絵文字を生成
- フォント・文字色・背景色・縁取りをカスタマイズ
- Slack/Discord 風のチャットプレビュー（ライト・ダーク）
- 180×180px の PNG でダウンロード
- PWA 対応

## 開発

```bash
npm run dev
```

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
