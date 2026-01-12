# おっさんゲーム

スイカゲームのルールをベースにした、人間の顔面を使用した落下合体型パズルゲームです。

## ゲーム概要

画面上部から顔面が落下してきて、同じ種類の顔面2つが接触すると次のレベルの顔面に合体します。合体によりスコアが加算され、最大レベルの顔面同士が合体すると「昇天エフェクト」が発生して高得点を獲得できます。画面外（上部の危険ラインを超える）に顔面があるとゲームオーバーです。

### 顔面の種類と合体チェーン

1. **赤ちゃんの顔** (Baby) → 2つで合体 → **少年の顔** (Child)
2. **少年の顔** (Child) → 2つで合体 → **青年の顔** (Youth)
3. **青年の顔** (Youth) → 2つで合体 → **大人の顔** (Adult)
4. **大人の顔** (Adult) → 2つで合体 → **中年の顔** (Middle)
5. **中年の顔** (Middle) → 2つで合体 → **高齢の顔** (Elder)
6. **高齢の顔** (Elder) + **高齢の顔** (Elder) → **昇天エフェクト**（上に登っていくアニメーション）で消滅

### スコアシステム

スイカゲームの得点システムを踏襲しています：

- レベル1（赤ちゃんの顔）: **2点**
- レベル2（少年の顔）: **6点**
- レベル3（青年の顔）: **10点**
- レベル4（大人の顔）: **14点**
- レベル5（中年の顔）: **18点**
- レベル6（高齢の顔）: **20点**
- **高齢の顔昇天**: **22点**

## 操作方法

- **落下前の位置決定**: マウスでX座標を決める（画面上部でマウスに追従）
- **落下開始**: マウスボタンを離すと落下開始
- **落下中は操作不可**: 一度落下を開始したら、位置の変更はできない

## 技術スタック

- **PixiJS**: 2Dグラフィックスレンダリング
- **Matter.js**: 物理エンジン（衝突判定、重力、ボディ管理）
- **Vanilla JavaScript (ES6+)**: コアロジック
- **GitHub Pages**: デプロイ先

## プロジェクト構造

```
oldguy_game/
├── assets/                    # 画像アセット
│   ├── boy1.png ~ boy6.png    # 各レベルの顔面画像
│   └── favicon.ico
├── src/
│   ├── main.js                 # エントリーポイント
│   ├── game.js                  # ゲームループ管理
│   ├── ball.js                  # ボール（顔面）クラス
│   ├── ballManager.js           # ボール生成・管理
│   ├── inputHandler.js          # マウス入力処理
│   ├── physics.js               # 物理定数・設定
│   ├── renderer.js              # レンダリング統合
│   │
│   ├── ball/                    # ボール関連モジュール
│   │   ├── graphicsFactory.js   # Graphics作成処理
│   │   ├── ballAnimation.js     # アニメーション処理
│   │   └── physicsConfigurator.js # 物理ボディ設定
│   │
│   ├── collision/               # 衝突処理モジュール
│   │   ├── collisionDetector.js # 衝突検出
│   │   ├── ballMerger.js        # ボール合体処理
│   │   ├── positionResolver.js  # 位置解決
│   │   ├── mergePositionCalculator.js # 合体位置計算
│   │   ├── mergedBallCreator.js # 合体後ボール生成
│   │   ├── wallCollisionResolver.js # 壁との衝突処理
│   │   └── ballCollisionResolver.js # ボールとの衝突処理
│   │
│   ├── game/                    # ゲーム状態管理
│   │   ├── gameState.js         # ゲーム状態
│   │   ├── gameInitializer.js   # 初期化処理
│   │   ├── gameOverChecker.js   # ゲームオーバー判定
│   │   ├── gameRestart.js       # リスタート処理
│   │   ├── physicsUpdater.js    # 物理エンジン更新前処理
│   │   └── gameUpdater.js       # ゲーム更新処理
│   │
│   ├── renderers/               # レンダリングモジュール
│   │   ├── uiRenderer.js        # UI（スコア）描画
│   │   ├── previewRenderer.js  # 次のボールプレビュー
│   │   ├── trajectoryRenderer.js # 落下軌道表示
│   │   ├── boxRenderer.js       # ゲーム箱・背景描画
│   │   ├── gameOverRenderer.js  # ゲームオーバー画面
│   │   ├── cloudRenderer.js     # 雲の描画・アニメーション
│   │   └── ascendEffectRenderer.js # 昇天エフェクト
│   │
│   └── utils/                   # ユーティリティ
│       ├── ballPositionClamper.js # 位置クランプ処理
│       ├── spriteScaler.js      # スプライトスケール計算
│       └── storage.js           # ローカルストレージ管理
│
├── index.html                   # HTMLエントリーポイント
├── package.json                 # プロジェクト設定
├── LICENSE                      # MITライセンス
└── README.md                    # このファイル
```
