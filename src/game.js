// メインのGameクラス（各モジュールを統合）

import { GameState } from './game/gameState.js'
import { GameInitializer } from './game/gameInitializer.js'
import { GameOverChecker } from './game/gameOverChecker.js'
import { createGround, createWalls } from './physics.js'
import { PhysicsUpdater } from './game/physicsUpdater.js'
import { GameUpdater } from './game/gameUpdater.js'

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
        // 物理エンジンの更新前の準備処理（物理エンジン更新前処理を分離）
        PhysicsUpdater.preparePhysicsUpdate(this)
        
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
    // すべての更新処理を実行（update()メソッドの責務を分離）
    GameUpdater.update(this)
  }
}
