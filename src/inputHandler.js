import { GAME_CONFIG } from './physics.js'

export class InputHandler {
  constructor(game, app) {
    this.game = game
    this.app = app
    
    // マウスイベントを登録
    this.app.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.app.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.app.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    
    // マウス移動を検出してボール位置を更新（canvas外でも追跡）
    this.app.canvas.addEventListener('mouseenter', (e) => {
      const rect = this.app.canvas.getBoundingClientRect()
      this.game.mouseX = e.clientX - rect.left
      this.game.mouseY = e.clientY - rect.top
    })
  }

  onMouseDown(e) {
    // マウス位置を更新
    const rect = this.app.canvas.getBoundingClientRect()
    this.game.mouseX = e.clientX - rect.left
    this.game.mouseY = e.clientY - rect.top
    
    // ボールが存在し、まだ落下していない場合、位置を更新
    if (this.game.currentBall && !this.game.currentBall.isFalling && !this.game.isGameOver) {
      // 箱の範囲内に制限（ボールの半径と壁の厚さを考慮）
      const boxLeft = this.game.gameConfig.boxLeft
      const boxRight = this.game.gameConfig.boxRight
      const ballRadius = this.game.currentBall.radius
      const wallThickness = GAME_CONFIG.WALL_THICKNESS
      
      // ボールが箱の範囲内に収まり、壁に触れないように制限
      const xClamped = Math.max(
        boxLeft + wallThickness + ballRadius,
        Math.min(boxRight - wallThickness - ballRadius, this.game.mouseX)
      )
      
      const boxTop = this.game.gameConfig.boxTop || 100
      const fixedY = boxTop - 50
      this.game.currentBall.graphics.x = xClamped
      this.game.currentBall.graphics.y = fixedY
    }
    // ボールの落下はonMouseUpで行う
  }

  onMouseUp(e) {
    // マウス位置を更新（念のため）
    const rect = this.app.canvas.getBoundingClientRect()
    this.game.mouseX = e.clientX - rect.left
    this.game.mouseY = e.clientY - rect.top
    
    // マウスアップでも落下開始（クールダウンチェック付き）
    if (this.game.currentBall && 
        !this.game.currentBall.isFalling && 
        !this.game.isGameOver &&
        !this.game.currentBall.isAnimating) { // アニメーション中は無効化
      this.game.ballManager.startBallFall()
    }
  }

  onMouseMove(e) {
    // マウス位置を常に追跡（最新の位置を確実に保存）
    const rect = this.app.canvas.getBoundingClientRect()
    this.game.mouseX = e.clientX - rect.left
    this.game.mouseY = e.clientY - rect.top
    
    // ボールが落下していない場合は常にマウスに追従（Graphicsのみ制御）
    if (this.game.currentBall && !this.game.currentBall.isFalling && !this.game.isGameOver) {
      // 箱の範囲内に制限（ボールの半径と壁の厚さを考慮）
      const boxLeft = this.game.gameConfig.boxLeft
      const boxRight = this.game.gameConfig.boxRight
      const ballRadius = this.game.currentBall.radius
      const wallThickness = GAME_CONFIG.WALL_THICKNESS
      
      // ボールが箱の範囲内に収まり、壁に触れないように制限
      const xClamped = Math.max(
        boxLeft + wallThickness + ballRadius,
        Math.min(boxRight - wallThickness - ballRadius, this.game.mouseX)
      )

      // Y座標は固定（初期位置を維持）
      const boxTop = this.game.gameConfig.boxTop || 100
      const fixedY = boxTop - 50

      // Graphicsの位置を直接変更（Bodyはupdate()で同期される）
      this.game.currentBall.graphics.x = xClamped
      this.game.currentBall.graphics.y = fixedY
      
      // 軌道を更新（TrajectoryRenderer内でスロットル処理されているため、過度な更新は防がれる）
      this.game.renderer.updateTrajectory()
    }
  }
}

