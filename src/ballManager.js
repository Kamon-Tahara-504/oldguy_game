import { Ball } from './ball.js'
import { BALL_LEVELS, GAME_CONFIG } from './physics.js'
import { BallPositionClamper } from './utils/ballPositionClamper.js'
import { BallPhysicsConfigurator } from './ball/physicsConfigurator.js'

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
    // ボールの生成位置を計算（位置のクランプ処理を共通化）
    const mouseX = this.game.mouseX || (this.game.gameConfig.boxLeft + this.game.gameConfig.boxRight) / 2
    const spawnPosition = BallPositionClamper.calculateSpawnPosition(mouseX, ballRadius, this.game.gameConfig)
    const startX = spawnPosition.x
    const startY = spawnPosition.y

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
    BallPhysicsConfigurator.configureBodyForSpawn(this.game.currentBall.body, this.Matter)
    
    // Graphicsの位置を設定（Bodyは後で同期される）
    this.game.currentBall.graphics.x = startX
    this.game.currentBall.graphics.y = startY

    // アニメーションを開始
    this.game.currentBall.startSpawnAnimation()

    // 次のボールのレベルを更新
    // nextBallLevelをnextNextBallLevelに移動し、新しいnextNextBallLevelを決定
    this.game.nextBallLevel = this.game.nextNextBallLevel
    this.game.nextNextBallLevel = Math.floor(Math.random() * 4) + 1 // 次の次のボールのレベルをランダムに決定（1-4レベル）
    this.game.renderer.updatePreview()
  }

  startBallFall() {
    if (!this.game.currentBall || this.game.currentBall.isFalling || this.game.isGameOver) return

    // アニメーション中は投下を無効化
    if (this.game.currentBall.isAnimating) {
      return
    }

    // クールダウンチェック（400msに1回のみ）
    const currentTime = Date.now()
    if (currentTime - this.game.lastBallDropTime < this.game.ballDropCooldown) {
      return // クールダウン中は何もしない
    }

    // 最新のマウス位置でGraphicsを更新（念のため）
    // 箱の範囲内に収まるように調整（位置のクランプ処理を共通化）
    const ballRadius = this.game.currentBall.radius
    const spawnPosition = BallPositionClamper.calculateSpawnPosition(this.game.mouseX, ballRadius, this.game.gameConfig)
    this.game.currentBall.graphics.x = spawnPosition.x
    this.game.currentBall.graphics.y = spawnPosition.y

    // Graphicsの現在位置を取得
    const currentX = this.game.currentBall.graphics.x
    const currentY = this.game.currentBall.graphics.y

    // 動的ボディとして設定（物理エンジン設定処理を共通化）
    BallPhysicsConfigurator.configureBodyForFall(
      this.game.currentBall.body,
      this.Matter,
      currentX,
      currentY
    )
    
    // 落下開始
    this.game.currentBall.startFall()

    // ボールリストに追加
    this.game.balls.push(this.game.currentBall)

    // クールダウンタイマーを更新
    this.game.lastBallDropTime = currentTime

    // 予測線を即座にクリア
    this.game.renderer.trajectoryRenderer.clear()

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

