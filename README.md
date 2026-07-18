# Mobdev00

Next.js で作ったスネークバード風ミニゲームです。

## ゲーム仕様

- 詳細仕様は [docs/game-spec.md](docs/game-spec.md) を参照してください。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開くと遊べます。

## ルール

- 矢印キーまたは `W/A/S/D` で 1 手ずつ移動
- 各手の入力後に重力で下に落下
- 岩と壁と自分の体にぶつかるとゲームオーバー
- フルーツを 8 個集めるとクリア
- 画面のボタン操作はモバイル向け

## ビルド

```bash
npm run build
```
