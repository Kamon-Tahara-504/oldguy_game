import { BALL_LEVELS } from './physics.js'

export class Renderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.groundGraphics = null
    this.wallGraphics = []
    this.boxTopGraphics = null
    this.scoreText = null
    this.previewGraphics = [] // プレビューを配列で管理（次のボールと次の次のボール）
  }

  // 地面と壁の描画を初期化
  initGroundAndWalls(walls) {
    // 箱の範囲を取得
    const boxLeft = this.game.gameConfig.boxLeft
    const boxRight = this.game.gameConfig.boxRight
    const boxTop = this.game.gameConfig.boxTop
    const boxBottom = this.game.gameConfig.boxBottom || this.game.gameConfig.groundY
    const wallThickness = 20

    // 箱の上端ラインを描画（視覚的な境界線のみ、物理的な壁はなし）
    this.boxTopGraphics = new this.PIXI.Graphics()
    this.boxTopGraphics.lineStyle(4, 0x654321, 0.95) // 暗めの茶色、太さ4px、不透明度0.95
    this.boxTopGraphics.moveTo(boxLeft, boxTop)
    this.boxTopGraphics.lineTo(boxRight, boxTop)
    this.app.stage.addChild(this.boxTopGraphics)

    // 箱の底面（地面）を描画
    this.groundGraphics = new this.PIXI.Graphics()
    this.groundGraphics.beginFill(0x8b4513) // 茶色
    this.groundGraphics.lineStyle(4, 0x654321, 0.95) // 箱の境界線として明確に（太さ4px、不透明度0.95）
    this.groundGraphics.drawRect(boxLeft, boxBottom - 10, boxRight - boxLeft, 20)
    this.groundGraphics.endFill()
    this.app.stage.addChild(this.groundGraphics)

    // 箱の側面（左右の壁）を描画
    walls.forEach((wall, index) => {
      const wallGraphics = new this.PIXI.Graphics()
      wallGraphics.beginFill(0x654321) // 暗めの茶色
      wallGraphics.lineStyle(4, 0x543210, 0.95) // 箱の境界線（太さ4px、不透明度0.95）
      wallGraphics.drawRect(
        wall.bounds.min.x,
        wall.bounds.min.y,
        wall.bounds.max.x - wall.bounds.min.x,
        wall.bounds.max.y - wall.bounds.min.y
      )
      wallGraphics.endFill()
      this.app.stage.addChild(wallGraphics)
      this.wallGraphics.push(wallGraphics)
    })
  }

  // スコア表示を初期化
  initScore() {
    this.scoreText = new this.PIXI.Text(`Score: ${this.game.score}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2,
    })
    this.scoreText.x = 10
    this.scoreText.y = 10
    this.app.stage.addChild(this.scoreText)
  }

  // スコア表示を更新
  updateScore() {
    if (this.scoreText) {
      this.scoreText.text = `Score: ${this.game.score}`
    }
  }

  // プレビューを更新
  updatePreview() {
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

  // ゲームオーバーメッセージを表示
  showGameOver() {
    const gameOverText = new this.PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xff0000,
      stroke: 0x000000,
      strokeThickness: 4,
    })
    gameOverText.x = this.game.gameConfig.width / 2 - gameOverText.width / 2
    gameOverText.y = this.game.gameConfig.height / 2 - gameOverText.height / 2
    this.app.stage.addChild(gameOverText)
  }
}

