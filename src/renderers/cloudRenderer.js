// 雲の描画と管理

export class CloudRenderer {
  constructor(game, app, PIXI) {
    this.game = game
    this.app = app
    this.PIXI = PIXI
    this.clouds = []
    this.cloudContainer = null
  }

  // 雲を初期化して配置
  init() {
    // 既存の雲をクリア
    if (this.cloudContainer) {
      if (this.cloudContainer.parent) {
        this.app.stage.removeChild(this.cloudContainer)
      }
      this.cloudContainer.destroy({ children: true })
    }

    // 雲用のコンテナを作成
    this.cloudContainer = new this.PIXI.Container()
    this.clouds = []

    // 雲の数: 6〜8個
    const cloudCount = 6 + Math.floor(Math.random() * 3)
    const width = this.game.gameConfig.width
    const height = this.game.gameConfig.height
    const maxY = height * 0.6 // 画面の上半分

    // 雲を生成
    for (let i = 0; i < cloudCount; i++) {
      // サイズをランダムに決定（小・中・大）
      const sizeType = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
      
      // X座標: 画面外も含めてランダムに配置
      const x = -200 + Math.random() * (width + 400)
      
      // Y座標: 画面の上半分に配置
      const y = Math.random() * maxY
      
      const cloud = this.createCloud(x, y, sizeType)
      this.clouds.push(cloud)
      this.cloudContainer.addChild(cloud.graphics)
    }

    // 雲コンテナを背景の上に配置（index 1: 背景グラデーションの上）
    // 背景が index 0 なので、雲は index 1 に配置
    this.app.stage.addChildAt(this.cloudContainer, 1)
  }

  // 雲の形状を作成
  createCloud(x, y, size) {
    const graphics = new this.PIXI.Graphics()
    
    // サイズに応じたパラメータ
    const sizeParams = {
      small: {
        ellipseCount: 3 + Math.floor(Math.random() * 2), // 3-4個
        maxWidth: 80 + Math.random() * 40, // 80-120px
        maxHeight: 40 + Math.random() * 20, // 40-60px
        speed: 0.2,
        alpha: 0.6 + Math.random() * 0.2 // 0.6-0.8
      },
      medium: {
        ellipseCount: 4 + Math.floor(Math.random() * 2), // 4-5個
        maxWidth: 120 + Math.random() * 60, // 120-180px
        maxHeight: 60 + Math.random() * 30, // 60-90px
        speed: 0.15,
        alpha: 0.7 + Math.random() * 0.15 // 0.7-0.85
      },
      large: {
        ellipseCount: 5 + Math.floor(Math.random() * 2), // 5-6個
        maxWidth: 180 + Math.random() * 70, // 180-250px
        maxHeight: 90 + Math.random() * 30, // 90-120px
        speed: 0.1,
        alpha: 0.75 + Math.random() * 0.15 // 0.75-0.9
      }
    }

    const params = sizeParams[size]
    
    // 雲の形状を描画（複数の楕円を組み合わせ）
    graphics.beginFill(0xffffff, params.alpha)
    
    for (let i = 0; i < params.ellipseCount; i++) {
      // 各楕円の位置とサイズをランダムに決定
      const offsetX = (Math.random() - 0.5) * params.maxWidth * 0.8
      const offsetY = (Math.random() - 0.5) * params.maxHeight * 0.6
      const ellipseWidth = params.maxWidth * (0.4 + Math.random() * 0.4)
      const ellipseHeight = params.maxHeight * (0.4 + Math.random() * 0.4)
      
      graphics.drawEllipse(offsetX, offsetY, ellipseWidth / 2, ellipseHeight / 2)
    }
    
    graphics.endFill()
    
    // 位置を設定
    graphics.x = x
    graphics.y = y

    return {
      graphics: graphics,
      speed: params.speed,
      size: size
    }
  }

  // 雲を更新（移動）
  update() {
    if (!this.cloudContainer || this.clouds.length === 0) return

    const width = this.game.gameConfig.width

    for (const cloud of this.clouds) {
      // 雲を右に移動
      cloud.graphics.x += cloud.speed

      // 画面右端を超えたら、左端から再出現
      if (cloud.graphics.x > width + 300) {
        this.resetCloud(cloud)
      }
    }
  }

  // 雲をリセット（画面外から再出現）
  resetCloud(cloud) {
    const height = this.game.gameConfig.height
    const maxY = height * 0.6
    
    // 左端（画面外）から再出現
    cloud.graphics.x = -300
    // Y座標をランダムに再設定（画面の上半分）
    cloud.graphics.y = Math.random() * maxY
  }
}

