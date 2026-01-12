// ボールプレビューの描画

import { BALL_LEVELS } from '../physics.js'

export class PreviewRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.previewGraphics = []
  }

  // プレビューを更新
  update() {
    // 既存のプレビューを削除
    this.previewGraphics.forEach(graphics => {
      if (graphics && graphics.parent) {
        this.app.stage.removeChild(graphics)
        graphics.destroy()
      }
    })
    this.previewGraphics = []

    const previewY = 50
    const previewSpacing = 80 // プレビュー間の間隔
    const panelPadding = 15
    const FIXED_PREVIEW_RADIUS = 25 // 全てのプレビューで同じサイズ

    // 背景パネル（カード形式）
    const panelWidth = 180
    const panelHeight = 120
    const panelX = this.game.gameConfig.width - panelWidth - 20
    const panelY = previewY - panelPadding

    const panel = new this.PIXI.Graphics()
    panel.beginFill(0xffffff, 0.15) // 半透明の白
    panel.drawRoundedRect(0, 0, panelWidth, panelHeight, 12)
    panel.endFill()
    
    // パネルの影
    const panelShadow = new this.PIXI.Graphics()
    panelShadow.beginFill(0x000000, 0.1)
    panelShadow.drawRoundedRect(2, 2, panelWidth, panelHeight, 12)
    panelShadow.endFill()
    panel.addChildAt(panelShadow, 0)
    
    panel.x = panelX
    panel.y = panelY
    this.app.stage.addChild(panel)
    this.previewGraphics.push(panel)

    // 次のボールのプレビュー（左側）
    const nextLevelData = BALL_LEVELS[this.game.nextBallLevel]
    const nextPreviewRadius = FIXED_PREVIEW_RADIUS // 固定サイズ
    const nextPreviewX = panelX + panelWidth / 2 - previewSpacing / 2
    const nextPreviewY = panelY + panelHeight / 2

    // 円形ボール（背景）を作成（元の色を使用）
    const nextBallBackground = new this.PIXI.Graphics()
    nextBallBackground.beginFill(nextLevelData.color) // 元のボールの色
    nextBallBackground.lineStyle(2, 0x000000) // 黒い枠線
    nextBallBackground.drawCircle(0, 0, nextPreviewRadius)
    nextBallBackground.endFill()
    nextBallBackground.x = nextPreviewX
    nextBallBackground.y = nextPreviewY
    this.app.stage.addChild(nextBallBackground)
    this.previewGraphics.push(nextBallBackground)

    // 画像を使用したプレビュー
    const nextTexture = this.PIXI.Texture.from(nextLevelData.imagePath)
    const nextPreview = new this.PIXI.Sprite(nextTexture)
    
    // サイズを調整（ボールより少し小さく）
    // baseTextureのサイズを使用（読み込み前でも利用可能）
    const nextTextureWidth = nextTexture.baseTexture.width || nextTexture.baseTexture.realWidth || 100
    const nextTextureHeight = nextTexture.baseTexture.height || nextTexture.baseTexture.realHeight || 100
    const nextTargetSize = nextPreviewRadius * 1.8
    const nextBaseScale = nextTargetSize / Math.max(nextTextureWidth, nextTextureHeight)
    nextPreview.scale.set(nextBaseScale * (nextLevelData.imageScale || 1.0))
    nextPreview.anchor.set(0.5)
    nextPreview.x = nextPreviewX + (nextLevelData.imageOffsetX || 0) * nextPreview.scale.x
    nextPreview.y = nextPreviewY + (nextLevelData.imageOffsetY || 0) * nextPreview.scale.y
    this.app.stage.addChild(nextPreview)
    this.previewGraphics.push(nextPreview)

    // 次の次のボールのプレビュー（右側）
    const nextNextLevelData = BALL_LEVELS[this.game.nextNextBallLevel]
    const nextNextPreviewRadius = FIXED_PREVIEW_RADIUS // 固定サイズ
    const nextNextPreviewX = panelX + panelWidth / 2 + previewSpacing / 2
    const nextNextPreviewY = panelY + panelHeight / 2

    // 円形ボール（背景）を作成（元の色を使用）
    const nextNextBallBackground = new this.PIXI.Graphics()
    nextNextBallBackground.beginFill(nextNextLevelData.color) // 元のボールの色
    nextNextBallBackground.lineStyle(2, 0x000000) // 黒い枠線
    nextNextBallBackground.drawCircle(0, 0, nextNextPreviewRadius)
    nextNextBallBackground.endFill()
    nextNextBallBackground.x = nextNextPreviewX
    nextNextBallBackground.y = nextNextPreviewY
    this.app.stage.addChild(nextNextBallBackground)
    this.previewGraphics.push(nextNextBallBackground)

    // 画像を使用したプレビュー
    const nextNextTexture = this.PIXI.Texture.from(nextNextLevelData.imagePath)
    const nextNextPreview = new this.PIXI.Sprite(nextNextTexture)
    
    // サイズを調整（ボールより少し小さく）
    // baseTextureのサイズを使用（読み込み前でも利用可能）
    const nextNextTextureWidth = nextNextTexture.baseTexture.width || nextNextTexture.baseTexture.realWidth || 100
    const nextNextTextureHeight = nextNextTexture.baseTexture.height || nextNextTexture.baseTexture.realHeight || 100
    const nextNextTargetSize = nextNextPreviewRadius * 1.8
    const nextNextBaseScale = nextNextTargetSize / Math.max(nextNextTextureWidth, nextNextTextureHeight)
    nextNextPreview.scale.set(nextNextBaseScale * (nextNextLevelData.imageScale || 1.0))
    nextNextPreview.anchor.set(0.5)
    nextNextPreview.x = nextNextPreviewX + (nextNextLevelData.imageOffsetX || 0) * nextNextPreview.scale.x
    nextNextPreview.y = nextNextPreviewY + (nextNextLevelData.imageOffsetY || 0) * nextNextPreview.scale.y
    this.app.stage.addChild(nextNextPreview)
    this.previewGraphics.push(nextNextPreview)
  }
}

