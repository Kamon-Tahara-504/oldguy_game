import { createGround, createWalls, GAME_CONFIG } from '../physics.js'
import { Renderer } from '../renderer.js'
import { InputHandler } from '../inputHandler.js'
import { BallManager } from '../ballManager.js'
import { CollisionHandler } from '../collision/index.js'
import { GameRestart } from './gameRestart.js'

export class GameInitializer {
  constructor(game, Matter, PIXI) {
    this.game = game
    this.Matter = Matter
    this.PIXI = PIXI
  }

  initialize() {
    this.initializeEngine()
    this.initializeGameConfig()
    this.initializeGroundAndWalls()
    this.initializeModules()
    this.setupEventListeners()
  }

  initializeEngine() {
    // Matter.jsエンジンを作成
    const MatterLib = this.Matter.default || this.Matter
    if (!MatterLib || !MatterLib.Engine) {
      console.error('Matter.js is not loaded correctly. Matter:', this.Matter)
      return
    }
    this.game.Matter = MatterLib
    this.game.engine = MatterLib.Engine.create()
    this.game.engine.world.gravity.y = GAME_CONFIG.gravity
    // スリープ機能を有効化（停止したボールの物理計算を省略し、振動も抑制）
    this.game.engine.enableSleeping = true
    // 衝突解決の精度を向上させる設定
    this.game.engine.positionIterations = 6  // 位置反復回数を増やす（デフォルト: 6）
    this.game.engine.velocityIterations = 4   // 速度反復回数を増やす（デフォルト: 4）
    // タイミング設定を調整（より滑らかな動き）
    this.game.engine.timing.timeScale = 1.0
  }

  initializeGameConfig() {
    // 動的サイズの設定を作成（保存して後で使用）
    this.game.gameConfig = {
      ...GAME_CONFIG,
      width: this.game.gameWidth,
      height: this.game.gameHeight,
      groundY: this.game.gameHeight - 50, // 地面の位置を動的に調整
    }

    // 箱の範囲を計算（画面内に配置）
    this.game.gameConfig.boxLeft = GAME_CONFIG.boxMarginLeft || 20
    this.game.gameConfig.boxRight = this.game.gameWidth - (GAME_CONFIG.boxMarginRight || 20)
    this.game.gameConfig.boxTop = GAME_CONFIG.boxMarginTop || 100
    this.game.gameConfig.boxBottom = this.game.gameConfig.groundY
    // 箱の上端Y座標（ゲームオーバー判定用）
    this.game.gameConfig.boxTopY = this.game.gameConfig.boxTop
  }

  initializeGroundAndWalls() {
    // 地面を作成
    this.game.ground = createGround(this.game.engine, this.game.gameConfig, this.game.Matter)

    // 壁を作成
    this.game.walls = createWalls(this.game.engine, this.game.gameConfig, this.game.Matter)
  }

  initializeModules() {
    // 各モジュールを初期化
    this.game.renderer = new Renderer(this.game, this.game.app, this.PIXI)
    this.game.inputHandler = new InputHandler(this.game, this.game.app)
    this.game.ballManager = new BallManager(this.game, this.game.engine, this.game.Matter, this.PIXI)
    this.game.collisionHandler = new CollisionHandler(this.game, this.game.Matter)
    this.game.gameRestart = new GameRestart(this.game)

    // 地面と壁の描画
    this.game.renderer.initGroundAndWalls(this.game.walls)

    // スコア表示を初期化
    this.game.renderer.initScore()

    // 次のボールプレビュー
    this.game.renderer.updatePreview()
  }

  setupEventListeners() {
    // 衝突イベントを設定
    this.game.Matter.Events.on(this.game.engine, 'collisionStart', (event) => {
      this.game.collisionHandler.handleCollision(event)
    })
    // collisionActiveイベントも追加（継続的な衝突を検出）
    this.game.Matter.Events.on(this.game.engine, 'collisionActive', (event) => {
      this.game.collisionHandler.handleCollision(event)
    })
  }
}

