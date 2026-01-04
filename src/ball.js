import { BALL_LEVELS } from './physics.js'

export class Ball {
  constructor(engine, container, x, y, level, Matter, PIXI) {
    this.engine = engine
    this.container = container
    this.level = level
    this.Matter = Matter
    this.PIXI = PIXI
    this.isFalling = false
    this.isMerging = false

    const levelData = BALL_LEVELS[level]
    if (!levelData) {
      throw new Error(`Invalid ball level: ${level}`)
    }

    this.radius = levelData.radius
    this.color = levelData.color
    this.score = levelData.score

    // Matter.js Bodyを作成
    this.body = Matter.Bodies.circle(x, y, this.radius, {
      restitution: 0.4, // バウンス係数
      friction: 0.6,    // 摩擦係数
      frictionAir: 0.01, // 空気抵抗
      gravityScale: 0,  // 初期状態では重力を無効化
    })

    // エンジンに追加
    Matter.World.add(engine.world, this.body)

    // PixiJS Graphicsを作成
    this.graphics = new PIXI.Graphics()
    this.graphics.beginFill(this.color)
    this.graphics.lineStyle(2, 0x000000)
    this.graphics.drawCircle(0, 0, this.radius)
    this.graphics.endFill()
    container.addChild(this.graphics)
  }

  // 落下を開始
  startFall() {
    this.isFalling = true
    // Matter.jsのエンジンレベルの重力を使用
  }

  // 更新（位置を同期）
  // 落下中はBodyの位置でGraphicsを制御、落下前はGraphicsの位置でBodyを制御
  update() {
    if (this.graphics && this.body) {
      if (this.isFalling) {
        // 落下中：Bodyの位置をGraphicsに反映
        this.graphics.x = this.body.position.x
        this.graphics.y = this.body.position.y
        this.graphics.rotation = this.body.angle
      } else {
        // 落下前：Graphicsの位置をBodyに反映（静的ボディとして位置を固定）
        this.Matter.Body.setPosition(this.body, {
          x: this.graphics.x,
          y: this.graphics.y
        })
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

