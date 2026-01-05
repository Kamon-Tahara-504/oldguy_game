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
    this.previewGraphics = null
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
    // プレビューを削除
    if (this.previewGraphics) {
      this.app.stage.removeChild(this.previewGraphics)
      this.previewGraphics.destroy()
    }

    // 新しいプレビューを作成
    const previewX = this.game.gameConfig.width - 80
    const previewY = 50
    const levelData = BALL_LEVELS[this.game.nextBallLevel]
    const previewRadius = levelData.radius * 0.6

    this.previewGraphics = new this.PIXI.Graphics()
    this.previewGraphics.beginFill(levelData.color)
    this.previewGraphics.lineStyle(2, 0x000000)
    this.previewGraphics.drawCircle(0, 0, previewRadius)
    this.previewGraphics.endFill()
    this.previewGraphics.x = previewX
    this.previewGraphics.y = previewY
    this.app.stage.addChild(this.previewGraphics)
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

