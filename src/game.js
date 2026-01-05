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
    this.nextNextBallLevel = Math.floor(Math.random() * 4) + 1 // 次の次のボールのレベル（1-4レベル）
    this.isDragging = false
    this.ground = null
    this.walls = []
    this.score = 0
    this.isGameOver = false
    // ハイスコアをlocalStorageから読み込み
    this.highScore = parseInt(localStorage.getItem('oldguy_game_highscore') || '0', 10)
    
    // 動的サイズを取得（後で更新されるが、初期値として設定）
    this.gameWidth = this.app.screen.width
    this.gameHeight = this.app.screen.height
    
    // マウス位置を追跡
    this.mouseX = this.gameWidth / 2  // 初期値は中央
    this.mouseY = 50
    
    // ボール放出のクールダウン（1秒 = 1000ミリ秒）
    this.lastBallDropTime = 0
    this.ballDropCooldown = 1000 // 1秒

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
    // 衝突解決の精度を向上させる設定
    this.engine.positionIterations = 6  // 位置反復回数を増やす（デフォルト: 6）
    this.engine.velocityIterations = 4   // 速度反復回数を増やす（デフォルト: 4）
    // タイミング設定を調整（より滑らかな動き）
    this.engine.timing.timeScale = 1.0

    // 動的サイズの設定を作成（保存して後で使用）
    this.gameConfig = {
      ...GAME_CONFIG,
      width: this.gameWidth,
      height: this.gameHeight,
      groundY: this.gameHeight - 50, // 地面の位置を動的に調整
    }

    // 箱の範囲を計算（画面内に配置）
    this.gameConfig.boxLeft = GAME_CONFIG.boxMarginLeft || 20
    this.gameConfig.boxRight = this.gameWidth - (GAME_CONFIG.boxMarginRight || 20)
    this.gameConfig.boxTop = GAME_CONFIG.boxMarginTop || 100
    this.gameConfig.boxBottom = this.gameConfig.groundY
    // 箱の上端Y座標（ゲームオーバー判定用）
    this.gameConfig.boxTopY = this.gameConfig.boxTop

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
    // collisionActiveイベントも追加（継続的な衝突を検出）
    this.Matter.Events.on(this.engine, 'collisionActive', (event) => {
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
      // 合体直後のボールも除外（位置が確定するまで）
      if (ball.isFalling && !ball.fallComplete && !ball.isMerging) {
        // 落下開始直後（0.5秒以内）は判定から除外（ボールが箱の上端より上から落下してくるのは正常）
        if (ball.fallStartTime && Date.now() - ball.fallStartTime < 500) {
          continue
        }
        
        const ballTop = ball.body.position.y - ball.radius
        
        // ボールの大部分（50%以上）が箱の上端を超えた場合のみゲームオーバー
        // ボールの上部が箱の上端より上にあり、かつ箱の上端からボールの上部までの距離がボールの半径の50%以上である場合
        // かつ、ボールが箱の範囲内（boxLeft ～ boxRight）にある場合
        if (ballTop < this.gameConfig.boxTopY && 
            (this.gameConfig.boxTopY - ballTop) >= ball.radius * 0.5 &&
            ball.body.position.x >= this.gameConfig.boxLeft && 
            ball.body.position.x <= this.gameConfig.boxRight) {
          this.gameOver()
          return
        }
      }
    }
  }

  gameOver() {
    this.isGameOver = true
    // ハイスコアを更新
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('oldguy_game_highscore', this.highScore.toString())
    }
    this.renderer.showGameOver()
  }

  restart() {
    // 既存のボールをすべて削除
    this.balls.forEach(ball => {
      ball.destroy()
    })
    this.balls = []
    
    // 現在のボールを削除
    if (this.currentBall) {
      this.currentBall.destroy()
      this.currentBall = null
    }
    
    // ゲーム状態をリセット
    this.score = 0
    this.isGameOver = false
    this.nextBallLevel = 1
    this.nextNextBallLevel = Math.floor(Math.random() * 4) + 1
    this.lastBallDropTime = 0
    
    // Matter.jsエンジンの世界をクリア
    this.Matter.World.clear(this.engine.world, false)
    
    // 地面と壁を再作成
    this.ground = createGround(this.engine, this.gameConfig, this.Matter)
    this.walls = createWalls(this.engine, this.gameConfig, this.Matter)
    
    // 地面と壁の描画を再初期化
    this.renderer.initGroundAndWalls(this.walls)
    
    // スコア表示を更新
    this.renderer.updateScore()
    
    // プレビューを更新
    this.renderer.updatePreview()
    
    // 最初のボールを生成
    this.ballManager.createNextBall()
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
    // 注: fallCompleteは物理エンジンの動作を妨げないフラグとして使用
    // ボールが完全に停止するまで待つ（より緩和した条件）
    for (const ball of this.balls) {
      if (ball.isFalling && !ball.fallComplete) {
        const body = ball.body
        const velocity = Math.abs(body.velocity.x) + Math.abs(body.velocity.y)
        const angularVelocity = Math.abs(body.angularVelocity)
        const isGrounded = body.position.y >= this.gameConfig.groundY - ball.radius - 10
        
        // 速度と角速度が非常に小さい場合（ほぼ完全停止）かつ地面に到達している場合のみ、落下完了とみなす
        // 値は0.05に下げて、より完全に停止するまで待つ
        // ただし、fallComplete後も物理エンジンの影響を受け続ける（ball.jsのupdate関数で処理）
        if (velocity < 0.05 && angularVelocity < 0.05 && isGrounded) {
          ball.fallComplete = true
          // isFallingはtrueのままにしておく（物理エンジンの動作を妨げないため）
        }
      }
    }
  }
}
