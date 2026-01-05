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
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xff0000,
      stroke: 0x000000,
      strokeThickness: 4,
    })
    gameOverText.x = this.game.gameConfig.width / 2 - gameOverText.width / 2
    gameOverText.y = this.game.gameConfig.height / 2 - gameOverText.height / 2 - 80
    this.gameOverContainer.addChild(gameOverText)
    
    // リスタートボタン
    const buttonWidth = 200
    const buttonHeight = 50
    const buttonX = this.game.gameConfig.width / 2 - buttonWidth / 2
    const buttonY = gameOverText.y + gameOverText.height + 30
    
    const restartButton = new this.PIXI.Graphics()
    restartButton.beginFill(0x4CAF50)
    restartButton.lineStyle(2, 0x000000)
    restartButton.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 10)
    restartButton.endFill()
    restartButton.x = buttonX
    restartButton.y = buttonY
    restartButton.interactive = true
    restartButton.buttonMode = true
    
    // ボタンのテキスト
    const buttonText = new this.PIXI.Text('RESTART', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2,
    })
    buttonText.x = buttonWidth / 2 - buttonText.width / 2
    buttonText.y = buttonHeight / 2 - buttonText.height / 2
    restartButton.addChild(buttonText)
    
    // ボタンのホバー効果
    restartButton.on('pointerover', () => {
      restartButton.clear()
      restartButton.beginFill(0x45a049)
      restartButton.lineStyle(2, 0x000000)
      restartButton.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 10)
      restartButton.endFill()
      restartButton.addChild(buttonText)
    })
    
    restartButton.on('pointerout', () => {
      restartButton.clear()
      restartButton.beginFill(0x4CAF50)
      restartButton.lineStyle(2, 0x000000)
      restartButton.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 10)
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

