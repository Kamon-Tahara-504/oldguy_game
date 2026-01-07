// 落下予測線の描画（真下に向けて実線を表示）

export class TrajectoryRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.trajectoryGraphics = null
  }

  // 軌道を更新
  update() {
    // ボールが落下していない時のみ表示
    if (!this.game.currentBall) {
      this.clear()
      return
    }
    
    if (this.game.currentBall.isFalling) {
      this.clear()
      return
    }
    
    if (this.game.isGameOver) {
      this.clear()
      return
    }

    // 真下に向けて実線を描画
    this.drawVerticalLine()
  }

  // 真下に向けて実線を描画
  drawVerticalLine() {
    const ball = this.game.currentBall
    if (!ball || !ball.graphics) {
      this.clear()
      return
    }
    
    // ボールの位置を取得（graphicsの位置を使用、bodyの位置も確認）
    let startX = ball.graphics.x
    let startY = ball.graphics.y
    
    // graphicsの位置が無効な場合、bodyの位置を使用
    if (isNaN(startX) || isNaN(startY)) {
      if (ball.body && ball.body.position) {
        startX = ball.body.position.x
        startY = ball.body.position.y
      } else {
        this.clear()
        return
      }
    }
    
    const endY = this.game.gameConfig.groundY
    
    // 座標が有効か確認
    if (isNaN(startX) || isNaN(startY) || isNaN(endY)) {
      this.clear()
      return
    }
    
    // ボールの半径を取得
    const ballRadius = ball.radius
    
    // 予測線の開始位置をボールの下端に設定
    const lineStartY = startY + ballRadius
    
    // Graphicsが存在しない場合は新規作成
    if (!this.trajectoryGraphics) {
      this.trajectoryGraphics = new this.PIXI.Graphics()
      this.app.stage.addChild(this.trajectoryGraphics)
    }
    
    // 既存のGraphicsの内容をクリアして再描画
    this.trajectoryGraphics.clear()
    
    // 実線を描画（白色、薄く）
    // drawRectを使って細長い矩形を描画（より確実に表示される）
    // ボールの下端から地面まで描画（5px短く）
    const lineWidth = 3
    const lineEndY = endY - 10 // 5px短くする
    this.trajectoryGraphics.beginFill(0xffffff, 0.4) // 白色、透明度0.4
    this.trajectoryGraphics.drawRect(startX - lineWidth / 2, lineStartY, lineWidth, lineEndY - lineStartY)
    this.trajectoryGraphics.endFill()
    
    // ボールの下に表示されるように、ボールのインデックスより下に配置
    if (this.trajectoryGraphics.parent && ball.graphics.parent) {
      const ballIndex = this.app.stage.getChildIndex(ball.graphics)
      // ボールのインデックスより下（小さいインデックス）に配置
      // ボールと同じインデックスに配置すると、ボールの下に表示される
      this.app.stage.setChildIndex(this.trajectoryGraphics, ballIndex)
    }
  }

  // 軌道をクリア
  clear() {
    if (this.trajectoryGraphics) {
      if (this.trajectoryGraphics.parent) {
        this.app.stage.removeChild(this.trajectoryGraphics)
      }
      this.trajectoryGraphics.destroy()
      this.trajectoryGraphics = null
    }
  }
}
