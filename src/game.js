import { createGround, createWalls, GAME_CONFIG } from './physics.js'
import { Renderer } from './renderer.js'
import { InputHandler } from './inputHandler.js'
import { BallManager } from './ballManager.js'
import { CollisionHandler } from './collisionHandler.js'

export class Game {
  constructor(app, Matter, PIXI) {
    this.app = app
    this.PIXI = PIXI
    
    // Matter.jsは後で設定される（default exportの処理のため）
    this.balls = []
    this.currentBall = null
    this.nextBallLevel = 1
    this.isDragging = false
    this.ground = null
    this.walls = []
    this.score = 0
    this.isGameOver = false
    
    // 動的サイズを取得（後で更新されるが、初期値として設定）
    this.gameWidth = this.app.screen.width
    this.gameHeight = this.app.screen.height
    
    // マウス位置を追跡
    this.mouseX = this.gameWidth / 2  // 初期値は中央
    this.mouseY = 50
    
    // ボール放出のクールダウン（2秒 = 2000ミリ秒）
    this.lastBallDropTime = 0
    this.ballDropCooldown = 2000 // 2秒

    // Matter.jsエンジンを作成
    const MatterLib = Matter.default || Matter
    if (!MatterLib || !MatterLib.Engine) {
      console.error('Matter.js is not loaded correctly. Matter:', Matter)
      return
    }
    this.Matter = MatterLib
    this.engine = MatterLib.Engine.create()
    this.engine.world.gravity.y = GAME_CONFIG.gravity
    // スリープ機能を有効化（停止したボールの物理計算を省略し、振動も抑制）
    this.engine.enableSleeping = true

    // 動的サイズの設定を作成（保存して後で使用）
    this.gameConfig = {
      ...GAME_CONFIG,
      width: this.gameWidth,
      height: this.gameHeight,
      groundY: this.gameHeight - 50, // 地面の位置を動的に調整
    }

    // 地面を作成
    this.ground = createGround(this.engine, this.gameConfig, this.Matter)

    // 壁を作成
    this.walls = createWalls(this.engine, this.gameConfig, this.Matter)

    // 各モジュールを初期化
    this.renderer = new Renderer(this, app, PIXI)
    this.inputHandler = new InputHandler(this, app)
    this.ballManager = new BallManager(this, this.engine, this.Matter, PIXI)
    this.collisionHandler = new CollisionHandler(this, this.Matter)

    // 地面と壁の描画
    this.renderer.initGroundAndWalls(this.walls)

    // スコア表示を初期化
    this.renderer.initScore()

    // 次のボールプレビュー
    this.renderer.updatePreview()

    // 衝突イベントを設定
    this.Matter.Events.on(this.engine, 'collisionStart', (event) => {
      this.collisionHandler.handleCollision(event)
    })

    // ゲームループ
    this.app.ticker.add(() => {
      if (!this.isGameOver) {
        this.Matter.Engine.update(this.engine)
        this.update()
        this.checkGameOver()
      }
    })

    // 最初のボールを生成（初期マウス位置で）
    this.ballManager.createNextBall()
  }

  addScore(points) {
    this.score += points
    this.renderer.updateScore()
  }

  checkGameOver() {
    // 箱から溢れたボールがあるかチェック
    // ボールの上部（body.position.y - ball.radius）が箱の上端を超えたらゲームオーバー
    // currentBallは判定対象外（落下前のボールは箱の外にあるため除外）
    for (const ball of this.balls) {
      // 落下中でないボールも除外（合体処理中など）
      if (ball.isFalling) {
        const ballTop = ball.body.position.y - ball.radius
        // ボールの上部が箱の上端を超えたらゲームオーバー
        if (ballTop < this.gameConfig.boxTopY) {
          this.gameOver()
          return
        }
      }
    }
  }

  gameOver() {
    this.isGameOver = true
    this.renderer.showGameOver()
  }

  update() {
    // すべてのボールの位置を同期
    this.balls.forEach(ball => {
      ball.update()
    })

    // 現在のボールの位置を同期
    if (this.currentBall) {
      // 落下前のボールはGraphicsの位置でBodyを制御（Ball.update()で処理）
      this.currentBall.update()
    }
    
    // 落下中のボールのfallCompleteフラグを更新（合体後のボール用）
    // 注: 次のボールの生成はstartBallFall()で即座に行うため、ここでの判定は簡略化
    for (const ball of this.balls) {
      if (ball.isFalling && !ball.fallComplete) {
        const body = ball.body
        const velocity = Math.abs(body.velocity.x) + Math.abs(body.velocity.y)
        const isGrounded = body.position.y >= this.gameConfig.groundY - ball.radius - 10
        
        // 速度が非常に小さい場合（ほぼ停止）かつ地面に到達している場合、落下完了とみなす
        if (velocity < 0.5 && isGrounded) {
          ball.isFalling = false
          ball.fallComplete = true
        }
      }
    }
  }
}
