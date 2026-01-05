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
    const previewSpacing = 70 // プレビュー間の間隔

    // 次の次のボールのプレビュー（左側）
    const nextNextLevelData = BALL_LEVELS[this.game.nextNextBallLevel]
    const nextNextPreviewRadius = nextNextLevelData.radius * 0.6
    const nextNextPreviewX = this.game.gameConfig.width - 80 - previewSpacing

    const nextNextPreview = new this.PIXI.Graphics()
    nextNextPreview.beginFill(nextNextLevelData.color)
    nextNextPreview.lineStyle(2, 0x000000)
    nextNextPreview.drawCircle(0, 0, nextNextPreviewRadius)
    nextNextPreview.endFill()
    nextNextPreview.x = nextNextPreviewX
    nextNextPreview.y = previewY
    this.app.stage.addChild(nextNextPreview)
    this.previewGraphics.push(nextNextPreview)

    // 次のボールのプレビュー（右側）
    const nextLevelData = BALL_LEVELS[this.game.nextBallLevel]
    const nextPreviewRadius = nextLevelData.radius * 0.6
    const nextPreviewX = this.game.gameConfig.width - 80

    const nextPreview = new this.PIXI.Graphics()
    nextPreview.beginFill(nextLevelData.color)
    nextPreview.lineStyle(2, 0x000000)
    nextPreview.drawCircle(0, 0, nextPreviewRadius)
    nextPreview.endFill()
    nextPreview.x = nextPreviewX
    nextPreview.y = previewY
    this.app.stage.addChild(nextPreview)
    this.previewGraphics.push(nextPreview)
  }
}

