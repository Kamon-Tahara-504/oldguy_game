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

    // コンテナを作成（ボール背景と画像を管理）
    this.graphics = new PIXI.Container()
    
    // 円形ボール（背景）を作成（元の色を使用）
    const ballBackground = new PIXI.Graphics()
    ballBackground.beginFill(this.color) // 元のボールの色
    ballBackground.lineStyle(2, 0x000000) // 黒い枠線
    ballBackground.drawCircle(0, 0, this.radius)
    ballBackground.endFill()
    this.graphics.addChild(ballBackground)
    
    // PixiJS Spriteを作成（画像を使用）
    const texture = PIXI.Texture.from(this.imagePath)
    const sprite = new PIXI.Sprite(texture)
    
    // テクスチャのサイズを使用してスケールを計算
    const updateSpriteScale = () => {
      // baseTextureのサイズを使用（読み込み前でも利用可能）
      const textureWidth = texture.baseTexture.width || texture.baseTexture.realWidth || 100
      const textureHeight = texture.baseTexture.height || texture.baseTexture.realHeight || 100
      
      if (textureWidth > 0 && textureHeight > 0) {
        // ボールの半径に合わせて画像をスケール（少し小さくして余白を作る）
        const targetSize = this.radius * 1.8 // ボールより少し小さく
        const baseScale = targetSize / Math.max(textureWidth, textureHeight)
        sprite.scale.set(baseScale * this.imageScale)
      }
    }
    
    // テクスチャが読み込まれていない場合の処理
    if (!texture.baseTexture.valid) {
      texture.baseTexture.on('loaded', () => {
        updateSpriteScale()
      })
    }
    
    // 即座にスケールを設定（baseTextureのサイズは読み込み前でも利用可能）
    updateSpriteScale()
    
    // アンカーを中心に設定（回転の中心点）
    sprite.anchor.set(0.5)
    
    // 画像の位置オフセットを適用
    sprite.x = this.imageOffsetX
    sprite.y = this.imageOffsetY
    
    // 画像をボールの上に配置（背景の上）
    this.graphics.addChild(sprite)
    
    this.sprite = sprite // 後でアニメーションで使用するため保存
    
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
    this.isAnimating = true
    this.animationStartTime = Date.now()
    
    // アニメーション中は衝突を無効化
    this.Matter.Body.set(this.body, {
      collisionFilter: {
        group: 0,
        category: 0x0001,
        mask: 0x0000  // 衝突を無効化（maskを0に）
      }
    })
    
    // コンテナ全体をアニメーション（白色ボールと画像の両方）
    this.graphics.scale.set(0.3)
    this.graphics.alpha = 0
  }

  // イージング関数（ease-out）
  easeOut(t) {
    return 1 - Math.pow(1 - t, 3) // cubic ease-out
  }

  // アニメーションを更新
  updateAnimation() {
    if (!this.isAnimating || !this.animationStartTime) return

    const elapsed = Date.now() - this.animationStartTime
    const progress = Math.min(elapsed / this.animationDuration, 1.0)
    const easedProgress = this.easeOut(progress)

    // スケールと透明度を更新（コンテナ全体をアニメーション）
    const scale = 0.3 + (1.0 - 0.3) * easedProgress
    const alpha = 0 + (1.0 - 0) * easedProgress

    this.graphics.scale.set(scale)
    this.graphics.alpha = alpha

    // アニメーション完了時
    if (progress >= 1.0) {
      this.isAnimating = false
      this.graphics.scale.set(1.0)
      this.graphics.alpha = 1.0
      
      // 衝突を再有効化
      this.Matter.Body.set(this.body, {
        collisionFilter: {
          group: 0,
          category: 0x0001,
          mask: 0xFFFF  // すべてのカテゴリと衝突可能
        }
      })
    }
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

