// メインのGameクラス（各モジュールを統合）

import { GameState } from './game/gameState.js'
import { GameInitializer } from './game/gameInitializer.js'
import { GameOverChecker } from './game/gameOverChecker.js'
import { createGround, createWalls } from './physics.js'

export class Game {
  constructor(app, Matter, PIXI) {
    this.app = app
    this.PIXI = PIXI
    
    // ゲーム状態を管理
    this.state = new GameState()
    
    // 動的サイズを取得
    this.gameWidth = this.app.screen.width
    this.gameHeight = this.app.screen.height
    
    // マウス位置を追跡
    this.mouseX = this.gameWidth / 2  // 初期値は中央
    this.mouseY = 50

    // 初期化処理を実行
    const initializer = new GameInitializer(this, Matter, PIXI)
    initializer.initialize()

    // ゲームオーバー判定を初期化
    this.gameOverChecker = new GameOverChecker(this)

    // ゲームループ
    this.app.ticker.add((ticker) => {
      if (!this.state.isGameOver) {
        // 物理エンジンの更新前に、落下前のボールの位置と速度をリセット
        if (this.state.currentBall && !this.state.currentBall.isFalling) {
          const ball = this.state.currentBall
          // 静的ボディとして確実に設定
          this.Matter.Body.setStatic(ball.body, true)
          // Graphicsの位置をBodyに反映
          this.Matter.Body.setPosition(ball.body, {
            x: ball.graphics.x,
            y: ball.graphics.y
          })
          // 速度を0にリセット
          this.Matter.Body.setVelocity(ball.body, { x: 0, y: 0 })
          this.Matter.Body.setAngularVelocity(ball.body, 0)
          
          // アニメーション中は衝突を無効化（念のため）
          if (ball.isAnimating) {
            this.Matter.Body.set(ball.body, {
              collisionFilter: {
                group: 0,
                category: 0x0001,
                mask: 0x0000  // 衝突を無効化
              }
            })
          }
        }
        
        // 物理エンジンを更新（固定のタイムステップを使用）
        const deltaTime = 1000 / 60 // 60FPSを想定
        this.Matter.Engine.update(this.engine, deltaTime)
        
        this.update()
        this.checkGameOver()
      }
    })

    // 最初のボールを生成（初期マウス位置で）
    this.ballManager.createNextBall()
  }

  // ゲッター（後方互換性のため）
  get balls() { return this.state.balls }
  get currentBall() { return this.state.currentBall }
  set currentBall(value) { this.state.currentBall = value }
  get nextBallLevel() { return this.state.nextBallLevel }
  set nextBallLevel(value) { this.state.nextBallLevel = value }
  get nextNextBallLevel() { return this.state.nextNextBallLevel }
  set nextNextBallLevel(value) { this.state.nextNextBallLevel = value }
  get isDragging() { return this.state.isDragging }
  set isDragging(value) { this.state.isDragging = value }
  get score() { return this.state.score }
  set score(value) { this.state.score = value }
  get isGameOver() { return this.state.isGameOver }
  set isGameOver(value) { this.state.isGameOver = value }
  get highScore() { return this.state.highScore }
  set highScore(value) { this.state.highScore = value }
  get lastBallDropTime() { return this.state.lastBallDropTime }
  set lastBallDropTime(value) { this.state.lastBallDropTime = value }
  get ballDropCooldown() { return this.state.ballDropCooldown }

  addScore(points) {
    this.state.addScore(points)
    this.renderer.updateScore()
  }

  checkGameOver() {
    this.gameOverChecker.checkGameOver()
  }

  gameOver() {
    this.state.onGameOver()
    this.renderer.showGameOver()
  }

  restart() {
    this.gameRestart.restart()
  }

  // リサイズ処理
  handleResize() {
    // 画面サイズを更新
    this.gameWidth = this.app.screen.width
    this.gameHeight = this.app.screen.height

    // 固定箱サイズ
    const BOX_WIDTH = this.gameConfig.BOX_WIDTH
    const BOX_HEIGHT = this.gameConfig.BOX_HEIGHT
    
    // 箱を画面中央に再配置
    const boxLeft = (this.gameWidth - BOX_WIDTH) / 2
    const boxRight = boxLeft + BOX_WIDTH
    const boxTop = (this.gameHeight - BOX_HEIGHT) / 2
    const boxBottom = boxTop + BOX_HEIGHT

    // 箱の位置を更新
    this.gameConfig.width = this.gameWidth
    this.gameConfig.height = this.gameHeight
    this.gameConfig.groundY = boxBottom
    this.gameConfig.boxLeft = boxLeft
    this.gameConfig.boxRight = boxRight
    this.gameConfig.boxTop = boxTop
    this.gameConfig.boxBottom = boxBottom
    this.gameConfig.boxTopY = boxTop

    // 既存の物理オブジェクトを削除
    if (this.ground) {
      this.Matter.World.remove(this.engine.world, this.ground)
    }
    if (this.walls && this.walls.length > 0) {
      this.Matter.World.remove(this.engine.world, this.walls)
    }

    // 地面と壁を再作成
    this.ground = createGround(this.engine, this.gameConfig, this.Matter)
    this.walls = createWalls(this.engine, this.gameConfig, this.Matter)

    // 描画を更新（箱、壁、地面の描画を再描画）
    this.renderer.boxRenderer.init(this.walls)
  }

  update() {
    // すべてのボールの位置を同期
    this.state.balls.forEach(ball => {
      ball.update()
    })

    // 現在のボールの位置を同期
    if (this.state.currentBall) {
      // 落下前のボールはGraphicsの位置でBodyを制御（Ball.update()で処理）
      this.state.currentBall.update()
      
      // アニメーションを更新
      if (this.state.currentBall.isAnimating) {
        this.state.currentBall.updateAnimation()
      }
    }
    
    // 落下軌道を更新（ボールが落下していない時のみ）
    if (this.state.currentBall && !this.state.currentBall.isFalling && !this.state.isGameOver) {
      this.renderer.updateTrajectory()
    }
    
    // 雲を更新（パララックス効果）
    this.renderer.updateClouds()
    
    // UI要素を最前面に配置（ボールより前面に表示）
    this.renderer.ensureUIFront()
    
    // 落下中のボールのfallCompleteフラグを更新（合体後のボール用）
    // 注: fallCompleteは物理エンジンの動作を妨げないフラグとして使用
    // ボールが完全に停止するまで待つ（より緩和した条件）
    for (const ball of this.state.balls) {
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
