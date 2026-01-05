import { Ball } from './ball.js'
import { BALL_LEVELS } from './physics.js'

export class BallManager {
  constructor(game, engine, Matter, PIXI) {
    this.game = game
    this.engine = engine
    this.Matter = Matter
    this.PIXI = PIXI
  }

  createNextBall() {
    if (this.game.currentBall) return // 既にボールが存在する場合は生成しない
    if (this.game.isGameOver) return // ゲームオーバー中は生成しない

    // 現在のマウス位置を使用（最新の位置を反映）
    const levelData = BALL_LEVELS[this.game.nextBallLevel]
    const ballRadius = levelData.radius
    // マウス位置が有効な範囲内にあることを確認
    const clampedMouseX = Math.max(
      ballRadius,
      Math.min(
        this.game.gameConfig.width - ballRadius,
        this.game.mouseX || this.game.gameConfig.width / 2
      )
    )
    const startX = clampedMouseX
    const startY = 50

    this.game.currentBall = new Ball(
      this.engine,
      this.game.app.stage,
      startX,
      startY,
      this.game.nextBallLevel,
      this.Matter,
      this.PIXI
    )

    // 落下していない状態を確実に設定
    this.game.currentBall.isFalling = false
    this.game.currentBall.fallComplete = false // 落下完了フラグをリセット
    
    // 静的ボディとして設定（物理エンジンの影響を受けない）
    this.Matter.Body.setStatic(this.game.currentBall.body, true)
    
    // Graphicsの位置を設定（Bodyは後で同期される）
    this.game.currentBall.graphics.x = startX
    this.game.currentBall.graphics.y = startY

    // 次のレベルをランダムに決定（1-3レベル）
    this.game.nextBallLevel = Math.floor(Math.random() * 3) + 1
    this.game.renderer.updatePreview()
  }

  startBallFall() {
    if (!this.game.currentBall || this.game.currentBall.isFalling || this.game.isGameOver) return

    // クールダウンチェック（2秒に1回のみ）
    const currentTime = Date.now()
    if (currentTime - this.game.lastBallDropTime < this.game.ballDropCooldown) {
      return // クールダウン中は何もしない
    }

    // 最新のマウス位置でGraphicsを更新（念のため）
    const xClamped = Math.max(
      this.game.currentBall.radius,
      Math.min(this.game.gameConfig.width - this.game.currentBall.radius, this.game.mouseX)
    )
    const fixedY = 50
    this.game.currentBall.graphics.x = xClamped
    this.game.currentBall.graphics.y = fixedY

    // Graphicsの現在位置を取得
    const currentX = this.game.currentBall.graphics.x
    const currentY = this.game.currentBall.graphics.y

    // まず静的ボディから動的ボディに変更（変換時に位置がリセットされる可能性があるため）
    this.Matter.Body.setStatic(this.game.currentBall.body, false)
    
    // 変換後、位置を確実に設定（複数回設定して確実にする）
    this.Matter.Body.setPosition(this.game.currentBall.body, { x: currentX, y: currentY })
    
    // Bodyの速度と角速度を0にリセット
    this.Matter.Body.setVelocity(this.game.currentBall.body, { x: 0, y: 0 })
    this.Matter.Body.setAngularVelocity(this.game.currentBall.body, 0)
    
    // 重力を有効化
    this.Matter.Body.set(this.game.currentBall.body, { gravityScale: 1 })
    
    // Bodyの位置を再度設定（確実にするため）
    this.Matter.Body.setPosition(this.game.currentBall.body, { x: currentX, y: currentY })
    
    // Bodyをスリープ状態から解除（スリープしていると動かない）
    this.Matter.Body.set(this.game.currentBall.body, { sleepThreshold: Infinity })
    this.Matter.Sleeping.set(this.game.currentBall.body, false)
    
    // 落下開始
    this.game.currentBall.startFall()

    // ボールリストに追加
    this.game.balls.push(this.game.currentBall)

    // クールダウンタイマーを更新
    this.game.lastBallDropTime = currentTime

    // 現在のボールをクリア
    this.game.currentBall = null

    // クールダウン後に次のボールを生成
    setTimeout(() => {
      this.createNextBall()
    }, this.game.ballDropCooldown)
  }

  removeBall(ball) {
    const index = this.game.balls.indexOf(ball)
    if (index > -1) {
      this.game.balls.splice(index, 1)
    }
    ball.destroy()
  }
}

