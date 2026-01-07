// ゲームオーバー画面の描画（リスタートボタン含む）

export class GameOverRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.gameOverContainer = null
  }

  // ゲームオーバーメッセージを表示
  show() {
    // 既存のゲームオーバー画面を削除
    if (this.gameOverContainer) {
      this.app.stage.removeChild(this.gameOverContainer)
      this.gameOverContainer.destroy()
    }
    
    // ゲームオーバー画面のコンテナを作成
    this.gameOverContainer = new this.PIXI.Container()
    
    // GAME OVERテキスト
    const gameOverText = new this.PIXI.Text('GAME OVER', {
      fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      fontSize: 56,
      fill: 0x2c3e50, // ダークグレー
      fontWeight: '700',
    })
    gameOverText.x = this.game.gameConfig.width / 2 - gameOverText.width / 2
    gameOverText.y = this.game.gameConfig.height / 2 - gameOverText.height / 2 - 100
    this.gameOverContainer.addChild(gameOverText)
    
    // リスタートボタン
    const buttonWidth = 220
    const buttonHeight = 60
    const buttonX = this.game.gameConfig.width / 2 - buttonWidth / 2
    const buttonY = gameOverText.y + gameOverText.height + 40
    
    const restartButton = new this.PIXI.Graphics()
    
    // ボタンの影
    const buttonShadow = new this.PIXI.Graphics()
    buttonShadow.beginFill(0x000000, 0.2)
    buttonShadow.drawRoundedRect(2, 2, buttonWidth, buttonHeight, 16)
    buttonShadow.endFill()
    restartButton.addChild(buttonShadow)
    
    // ボタンの背景（グラデーション風）
    restartButton.beginFill(0x3498db) // モダンな青
    restartButton.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 16)
    restartButton.endFill()
    
    restartButton.x = buttonX
    restartButton.y = buttonY
    restartButton.interactive = true
    restartButton.buttonMode = true
    
    // ボタンのテキスト
    const buttonText = new this.PIXI.Text('RESTART', {
      fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: '600',
    })
    buttonText.x = buttonWidth / 2 - buttonText.width / 2
    buttonText.y = buttonHeight / 2 - buttonText.height / 2
    restartButton.addChild(buttonText)
    
    // ボタンのホバー効果
    restartButton.on('pointerover', () => {
      restartButton.clear()
      const shadow = new this.PIXI.Graphics()
      shadow.beginFill(0x000000, 0.25)
      shadow.drawRoundedRect(2, 2, buttonWidth, buttonHeight, 16)
      shadow.endFill()
      restartButton.addChild(shadow)
      restartButton.beginFill(0x2980b9) // 濃い青
      restartButton.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 16)
      restartButton.endFill()
      restartButton.addChild(buttonText)
    })
    
    restartButton.on('pointerout', () => {
      restartButton.clear()
      const shadow = new this.PIXI.Graphics()
      shadow.beginFill(0x000000, 0.2)
      shadow.drawRoundedRect(2, 2, buttonWidth, buttonHeight, 16)
      shadow.endFill()
      restartButton.addChild(shadow)
      restartButton.beginFill(0x3498db) // 元の青
      restartButton.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 16)
      restartButton.endFill()
      restartButton.addChild(buttonText)
    })
    
    // クリックイベント
    restartButton.on('pointerdown', () => {
      this.game.restart()
      // ゲームオーバー画面を削除
      this.hide()
    })
    
    this.gameOverContainer.addChild(restartButton)
    this.app.stage.addChild(this.gameOverContainer)
  }

  // ゲームオーバー画面を非表示
  hide() {
    if (this.gameOverContainer) {
      this.app.stage.removeChild(this.gameOverContainer)
      this.gameOverContainer.destroy()
      this.gameOverContainer = null
    }
  }
}

