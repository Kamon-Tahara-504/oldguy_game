import { BALL_LEVELS } from './physics.js'
import { BallGraphicsFactory } from './ball/graphicsFactory.js'
import { BallAnimation } from './ball/ballAnimation.js'

export class Ball {
  constructor(engine, container, x, y, level, Matter, PIXI) {
    this.engine = engine
    this.container = container
    this.level = level
    this.Matter = Matter
    this.PIXI = PIXI
    this.isFalling = false
    this.isMerging = false
    this.fallComplete = false // 落下完了フラグ
    this.fallStartTime = null // 落下開始時刻（ゲームオーバー判定の除外用）
    
    // アニメーション関連のプロパティ
    this.isAnimating = false
    this.animationStartTime = null
    this.animationDuration = 400 // 400ms

    const levelData = BALL_LEVELS[level]
    if (!levelData) {
      throw new Error(`Invalid ball level: ${level}`)
    }

    this.radius = levelData.radius
    this.color = levelData.color
    this.score = levelData.score
    this.imagePath = levelData.imagePath
    this.imageOffsetX = levelData.imageOffsetX || 0
    this.imageOffsetY = levelData.imageOffsetY || 0
    this.imageScale = levelData.imageScale || 1.0

    // Matter.js Bodyを作成
    this.body = Matter.Bodies.circle(x, y, this.radius, {
      restitution: 0.3,   // バウンス係数（適度な跳ね返り、振動を減らす）
      friction: 0.5,      // 摩擦係数（適度な摩擦、滑りすぎない）
      frictionAir: 0.02,  // 空気抵抗（適度な抵抗、振動を早く止める）
      gravityScale: 0,    // 初期状態では重力を無効化
      density: 0.001,     // 密度（軽く感じさせる）
      collisionFilter: {
        group: 0,        // グループ0（デフォルト）
        category: 0x0001, // カテゴリ1
        mask: 0xFFFF     // すべてのカテゴリと衝突可能（デフォルト）
      }
    })

    // エンジンに追加
    Matter.World.add(engine.world, this.body)

    // Graphicsを作成（ファクトリーを使用）
    const graphicsData = BallGraphicsFactory.createBallGraphics({
      radius: this.radius,
      color: this.color,
      imagePath: this.imagePath,
      imageOffsetX: this.imageOffsetX,
      imageOffsetY: this.imageOffsetY,
      imageScale: this.imageScale
    }, PIXI)
    
    this.graphics = graphicsData.container
    this.sprite = graphicsData.sprite // 後でアニメーションで使用するため保存
    
    container.addChild(this.graphics)
  }

  // 落下を開始
  startFall() {
    this.isFalling = true
    this.fallStartTime = Date.now() // 落下開始時刻を記録
    // Matter.jsのエンジンレベルの重力を使用
  }

  // アニメーションを開始
  startSpawnAnimation() {
    BallAnimation.startSpawnAnimation(this)
  }

  // アニメーションを更新
  updateAnimation() {
    BallAnimation.updateAnimation(this)
  }

  // 更新（位置を同期）
  // 落下中または落下完了後はBodyの位置でGraphicsを制御
  // 落下前は物理エンジン更新前に処理されるため、ここでは何もしない
  update() {
    if (this.graphics && this.body) {
      // 落下前（まだ落下していない状態）は物理エンジン更新前に処理されるため、ここでは何もしない
      if (!this.isFalling && !this.fallComplete) {
        // 物理エンジン更新前に処理されるため、ここでは何もしない
        return
      } else {
        // 落下中または落下完了後：Bodyの位置をGraphicsに反映
        // Bodyが存在し、位置が有効な場合のみ反映
        if (this.body.position && 
            !isNaN(this.body.position.x) && 
            !isNaN(this.body.position.y)) {
          this.graphics.x = this.body.position.x
          this.graphics.y = this.body.position.y
          this.graphics.rotation = this.body.angle
        }
      }
    }
  }

  // 破棄
  destroy() {
    this.Matter.World.remove(this.engine.world, this.body)
    this.container.removeChild(this.graphics)
    this.graphics.destroy()
  }
}

