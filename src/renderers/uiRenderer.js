// UI要素の描画（スコア、ハイスコア表示）

export class UIRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.scoreText = null
    this.highScoreText = null
  }

  // スコア表示を初期化
  init() {
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
    
    // ハイスコア表示を追加
    this.highScoreText = new this.PIXI.Text(`High Score: ${this.game.highScore}`, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffff00,
      stroke: 0x000000,
      strokeThickness: 2,
    })
    this.highScoreText.x = 10
    this.highScoreText.y = this.scoreText.y + this.scoreText.height + 5
    this.app.stage.addChild(this.highScoreText)
  }

  // スコア表示を更新
  update() {
    if (this.scoreText) {
      this.scoreText.text = `Score: ${this.game.score}`
    }
    // ハイスコアも更新
    if (this.highScoreText) {
      this.highScoreText.text = `High Score: ${this.game.highScore}`
    }
  }
}

