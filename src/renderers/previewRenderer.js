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

    // 次の次のボールのプレビュー（左側）
    const nextNextLevelData = BALL_LEVELS[this.game.nextNextBallLevel]
    const nextNextPreviewRadius = nextNextLevelData.radius * 0.5
    const nextNextPreviewX = panelX + panelWidth / 2 - previewSpacing / 2

    const nextNextPreview = new this.PIXI.Graphics()
    
    // 影を追加
    const nextNextShadow = new this.PIXI.Graphics()
    nextNextShadow.beginFill(0x000000, 0.2)
    nextNextShadow.drawCircle(2, 2, nextNextPreviewRadius)
    nextNextShadow.endFill()
    nextNextPreview.addChild(nextNextShadow)
    
    nextNextPreview.beginFill(nextNextLevelData.color)
    nextNextPreview.lineStyle(1, 0xffffff, 0.3) // 薄い白のストローク
    nextNextPreview.drawCircle(0, 0, nextNextPreviewRadius)
    nextNextPreview.endFill()
    nextNextPreview.x = nextNextPreviewX
    nextNextPreview.y = panelY + panelHeight / 2
    this.app.stage.addChild(nextNextPreview)
    this.previewGraphics.push(nextNextPreview)

    // 次のボールのプレビュー（右側）
    const nextLevelData = BALL_LEVELS[this.game.nextBallLevel]
    const nextPreviewRadius = nextLevelData.radius * 0.5
    const nextPreviewX = panelX + panelWidth / 2 + previewSpacing / 2

    const nextPreview = new this.PIXI.Graphics()
    
    // 影を追加
    const nextShadow = new this.PIXI.Graphics()
    nextShadow.beginFill(0x000000, 0.2)
    nextShadow.drawCircle(2, 2, nextPreviewRadius)
    nextShadow.endFill()
    nextPreview.addChild(nextShadow)
    
    nextPreview.beginFill(nextLevelData.color)
    nextPreview.lineStyle(1, 0xffffff, 0.3) // 薄い白のストローク
    nextPreview.drawCircle(0, 0, nextPreviewRadius)
    nextPreview.endFill()
    nextPreview.x = nextPreviewX
    nextPreview.y = panelY + panelHeight / 2
    this.app.stage.addChild(nextPreview)
    this.previewGraphics.push(nextPreview)
  }
}

