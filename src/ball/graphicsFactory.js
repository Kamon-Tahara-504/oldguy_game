// ボールのGraphics作成処理を分離するクラス

import { SpriteScaler } from '../utils/spriteScaler.js'

export class BallGraphicsFactory {
  /**
   * ボールのGraphicsコンテナを作成する
   * @param {Object} ball - ボールオブジェクト（radius, color, imagePath, imageOffsetX, imageOffsetY, imageScaleを含む）
   * @param {PIXI} PIXI - PixiJSライブラリ
   * @returns {Object} {container: PIXI.Container, sprite: PIXI.Sprite} Graphicsコンテナとスプライト
   */
  static createBallGraphics(ball, PIXI) {
    // コンテナを作成（ボール背景と画像を管理）
    const container = new PIXI.Container()
    
    // 円形ボール（背景）を作成（元の色を使用）
    const ballBackground = new PIXI.Graphics()
    ballBackground.beginFill(ball.color) // 元のボールの色
    ballBackground.lineStyle(2, 0x000000) // 黒い枠線
    ballBackground.drawCircle(0, 0, ball.radius)
    ballBackground.endFill()
    container.addChild(ballBackground)
    
    // PixiJS Spriteを作成（画像を使用）
    const texture = PIXI.Texture.from(ball.imagePath)
    const sprite = new PIXI.Sprite(texture)
    
    // スプライトのスケールを計算して適用（ユーティリティを使用）
    const targetSize = ball.radius * 1.8 // ボールより少し小さく
    const updateSpriteScale = () => {
      SpriteScaler.applyScale(sprite, texture, targetSize, ball.imageScale)
    }
    
    // テクスチャが読み込まれていない場合の処理
    if (!texture.baseTexture.valid) {
      texture.baseTexture.on('loaded', () => {
        updateSpriteScale()
      })
    }
    
    // 即座にスケールを設定（baseTextureのサイズは読み込み前でも利用可能）
    updateSpriteScale()
    
    // アンカーを中心に設定（回転の中心点）
    sprite.anchor.set(0.5)
    
    // 画像の位置オフセットを適用
    sprite.x = ball.imageOffsetX
    sprite.y = ball.imageOffsetY
    
    // 画像をボールの上に配置（背景の上）
    container.addChild(sprite)
    
    return {
      container: container,
      sprite: sprite
    }
  }
}
