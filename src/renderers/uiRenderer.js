// UI要素の描画（スコア、ハイスコア表示）

export class UIRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.scoreContainer = null
    this.scoreText = null
    this.highScoreText = null
    this.timeText = null
  }

  // スコア表示を初期化
  init() {
    // コンテナを作成
    this.scoreContainer = new this.PIXI.Container()
    
    // 背景パネル（カード形式）
    const panelPadding = 20
    const panelWidth = 200
    const panelHeight = 130 // 時間表示用に高さを増やす
    const panelX = 20
    const panelY = 20
    
    const panel = new this.PIXI.Graphics()
    panel.beginFill(0xffffff, 0.15) // 半透明の白
    panel.drawRoundedRect(0, 0, panelWidth, panelHeight, 12)
    panel.endFill()
    
    // 影を追加（複数の矩形で表現）
    const shadow = new this.PIXI.Graphics()
    shadow.beginFill(0x000000, 0.1)
    shadow.drawRoundedRect(2, 2, panelWidth, panelHeight, 12)
    shadow.endFill()
    this.scoreContainer.addChild(shadow)
    this.scoreContainer.addChild(panel)
    
    // 時間表示（Scoreの上に配置、同じサイズ）
    this.timeText = new this.PIXI.Text('Time: 00:00', {
      fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      fontSize: 28,
      fill: 0x2c3e50, // ダークグレー（Scoreと同じ色）
      fontWeight: '600',
    })
    this.timeText.x = panelPadding
    this.timeText.y = panelPadding
    this.scoreContainer.addChild(this.timeText)
    
    // スコアテキスト
    this.scoreText = new this.PIXI.Text(`Score: ${this.game.score}`, {
      fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      fontSize: 28,
      fill: 0x2c3e50, // ダークグレー
      fontWeight: '600',
    })
    this.scoreText.x = panelPadding
    this.scoreText.y = panelPadding + this.timeText.height + 8
    this.scoreContainer.addChild(this.scoreText)
    
    // ハイスコア表示
    this.highScoreText = new this.PIXI.Text(`High: ${this.game.highScore}`, {
      fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      fontSize: 20,
      fill: 0x7f8c8d, // ミディアムグレー
      fontWeight: '400',
    })
    this.highScoreText.x = panelPadding
    this.highScoreText.y = panelPadding + this.timeText.height + this.scoreText.height + 16
    this.scoreContainer.addChild(this.highScoreText)
    
    this.scoreContainer.x = panelX
    this.scoreContainer.y = panelY
    this.app.stage.addChild(this.scoreContainer)
    
    // スコア表示を最前面に配置（ボールより前面に表示）
    this.app.stage.setChildIndex(this.scoreContainer, this.app.stage.children.length - 1)
  }

  // 経過時間を「MM:SS」形式にフォーマット
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // スコア表示を更新
  update() {
    if (this.scoreText) {
      this.scoreText.text = `Score: ${this.game.score}`
    }
    // ハイスコアも更新
    if (this.highScoreText) {
      this.highScoreText.text = `High: ${this.game.highScore}`
    }
    // 時間表示を更新
    if (this.timeText) {
      const elapsedTime = this.game.state.getElapsedTime()
      const formattedTime = this.formatTime(elapsedTime)
      this.timeText.text = `Time: ${formattedTime}`
    }
    
    // スコア表示を最前面に配置（ボールより前面に表示）
    if (this.scoreContainer && this.scoreContainer.parent) {
      this.app.stage.setChildIndex(this.scoreContainer, this.app.stage.children.length - 1)
    }
  }
}

